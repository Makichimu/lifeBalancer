import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@example.com',
      displayName: 'Demo User',
    },
  });
  const chest = await prisma.muscleGroup.upsert({
    where: { name: 'Chest' },
    update: {},
    create: { name: 'Chest', muscles: { create: [{ name: 'Pectoralis major' }] } },
  });
  const barbell = await prisma.equipment.upsert({
    where: { name: 'Barbell' },
    update: {},
    create: { name: 'Barbell', barWeightKg: 20 },
  });
  await prisma.exercise.upsert({
    where: { slug: 'barbell-bench-press' },
    update: {},
    create: {
      slug: 'barbell-bench-press',
      name: 'Barbell Bench Press',
      type: 'STRENGTH',
      defaultEquipmentId: barbell.id,
      unilateral: false,
      metrics: { weight: true, reps: true, duration: false },
      muscles: { create: [{ muscleId: chest.muscles[0].id, role: 'PRIMARY' }] },
    },
  });
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
