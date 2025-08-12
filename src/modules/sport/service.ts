import { PrismaClient, OneRmFormula } from '@prisma/client';
const prisma = new PrismaClient();

// Epley: 1RM = w * (1 + reps/30)
const epley1RM = (w: number, reps: number) =>
  reps > 1 ? w * (1 + reps / 30) : w;

export async function createWorkout(
  userId: string,
  payload: {
    bodyweightKg?: number;
    notes?: string;
    exercises: Array<{
      exerciseId: string;
      orderIndex: number;
      supersetGroup?: number;
      sets: Array<{
        setIndex: number;
        setType:
          | 'WARMUP'
          | 'WORKING'
          | 'DROP'
          | 'BACKOFF'
          | 'FAILURE'
          | 'COOLDOWN';
        side?: 'LEFT' | 'RIGHT' | 'BOTH';
        weightKg?: number;
        repsActual?: number;
        repsTarget?: number;
        rpe?: number;
        rir?: number;
        durationSec?: number;
        distanceM?: number;
        restPlannedSec?: number;
        restActualSec?: number;
        assistanceKg?: number;
        tempo?: string;
        notes?: string;
      }>;
    }>;
  },
) {
  const workout = await prisma.workout.create({
    data: {
      userId,
      bodyweightKg: payload.bodyweightKg,
      notes: payload.notes ?? '',
      exercises: {
        create: payload.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          supersetGroup: ex.supersetGroup ?? null,
          sets: {
            create: ex.sets.map((s) => ({ ...s, side: s.side ?? 'BOTH' })),
          },
        })),
      },
    },
    include: { exercises: { include: { sets: true, exercise: true } } },
  });

  let totalVolumeKg = 0,
    totalReps = 0,
    totalSets = 0;
  const oneRmEstimates: Array<{
    workoutId: string;
    exerciseId: string;
    setId: string;
    formula: OneRmFormula;
    estimatedKg: number;
  }> = [];

  workout.exercises.forEach((wex) => {
    wex.sets.forEach((set) => {
      totalSets += 1;
      if (set.repsActual) totalReps += set.repsActual;
      if (set.weightKg && set.repsActual) {
        totalVolumeKg += set.weightKg * set.repsActual;
        const est = epley1RM(set.weightKg, set.repsActual);
        oneRmEstimates.push({
          workoutId: workout.id,
          exerciseId: wex.exerciseId,
          setId: set.id,
          formula: 'EPLEY',
          estimatedKg: Math.round(est * 100) / 100,
        });
      }
    });
  });

  await prisma.$transaction([
    prisma.workout.update({
      where: { id: workout.id },
      data: { totalVolumeKg, totalReps, totalSets },
    }),
    ...oneRmEstimates.map((e) => prisma.oneRmEstimate.create({ data: e })),
  ]);

  return prisma.workout.findUnique({
    where: { id: workout.id },
    include: {
      exercises: { include: { sets: true, exercise: true } },
      oneRmEstimates: true,
    },
  });
}
