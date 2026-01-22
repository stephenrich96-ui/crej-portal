// Script to update training order values for better organization
// Run with: tsx scripts/update-training-orders.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating training order values...\n');

  // Update "Start Here" to order 0
  await prisma.training.updateMany({
    where: {
      title: { contains: 'Start Here' },
      program: 'DSPD',
    },
    data: { order: 0 },
  });
  console.log('  ✓ Set "Start Here" to order 0');

  // Update trainings with deadlines to order 1-5
  const deadlineTrainings = [
    { title: 'Medicaid 101', order: 1 },
    { title: 'Supporting a vision for employment', order: 2 },
  ];

  for (const { title, order } of deadlineTrainings) {
    await prisma.training.updateMany({
      where: {
        title: { contains: title },
        program: 'DSPD',
      },
      data: { order },
    });
    console.log(`  ✓ Set "${title}" to order ${order}`);
  }

  // Update initial required trainings to order 10-20
  const initialTrainings = [
    { title: 'Acquiring and maintaining integrated community-based housing', order: 10 },
    { title: 'Profound and complex disabilities', order: 11 },
    { title: 'Ethics training', order: 12 },
    { title: 'Finance', order: 13 },
    { title: 'Records management', order: 14 },
    { title: 'Health monitoring: The fatal five', order: 15 },
  ];

  for (const { title, order } of initialTrainings) {
    await prisma.training.updateMany({
      where: {
        title: { contains: title },
        program: 'DSPD',
      },
      data: { order },
    });
    console.log(`  ✓ Set "${title}" to order ${order}`);
  }

  // Update FY26 trainings to order 20-30
  const fy26Trainings = [
    { title: 'Level of care and Medicaid eligibility', order: 20 },
    { title: 'State match program', order: 21 },
    { title: 'Challenging behaviors', order: 22 },
    { title: 'Disability 101', order: 23 },
    { title: 'Self-administered (SAS)', order: 24 },
  ];

  for (const { title, order } of fy26Trainings) {
    await prisma.training.updateMany({
      where: {
        title: { contains: title },
        program: 'DSPD',
      },
      data: { order },
    });
    console.log(`  ✓ Set "${title}" to order ${order}`);
  }

  // Update annual trainings to order 30-40
  const annualTrainings = [
    { title: 'Incident/fatality reporting', order: 30 },
    { title: 'Office of Services Review', order: 31 },
    { title: 'Settings Rule and monitoring', order: 32 },
  ];

  for (const { title, order } of annualTrainings) {
    await prisma.training.updateMany({
      where: {
        title: { contains: title },
        program: 'DSPD',
      },
      data: { order },
    });
    console.log(`  ✓ Set "${title}" to order ${order}`);
  }

  // Update every-other-year trainings to order 40-50
  const alternateYearTrainings = [
    { title: 'Person-centered approaches', order: 40 },
    { title: 'Person-centered planning (Utah specific)', order: 41 },
  ];

  for (const { title, order } of alternateYearTrainings) {
    await prisma.training.updateMany({
      where: {
        title: { contains: title },
        program: 'DSPD',
      },
      data: { order },
    });
    console.log(`  ✓ Set "${title}" to order ${order}`);
  }

  console.log('\n✅ Training order values updated');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
