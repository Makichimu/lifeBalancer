import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createWorkout } from './service.js';

interface AuthedRequest extends Request {
  user?: { id: string };
}

const prisma = new PrismaClient();
const r = Router();

r.get('/exercises', async (_req: Request, res: Response) => {
  const list = await prisma.exercise.findMany({ include: { muscles: true } });
  res.json(list);
});

r.post('/workouts', async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.id || 'demo-user';
  const out = await createWorkout(userId, req.body);
  res.status(201).json(out);
});

r.get('/workouts', async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.id || 'demo-user';
  const ws = await prisma.workout.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: {
      exercises: { include: { sets: true, exercise: true } },
      oneRmEstimates: true,
    },
  });
  res.json(ws);
});

r.get('/progress/:exerciseId', async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.id || 'demo-user';
  const { exerciseId } = req.params;
  const est = await prisma.oneRmEstimate.findMany({
    where: { exerciseId, workout: { userId } },
    orderBy: { date: 'asc' },
  });
  res.json({ oneRm: est, last: est.at(-1) ?? null });
});

export default r;
