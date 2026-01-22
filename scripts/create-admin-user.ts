// Script to create the primary admin user
// Run with: tsx scripts/create-admin-user.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating primary admin user...\n');

  const email = 'srichardson@crejllc.net';
  const name = 'Primary Administrator';

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (existing) {
    // Update name and ensure ADMIN role
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
      },
    });

    // Ensure ADMIN role exists
    const hasAdminRole = existing.roles.some(r => r.role === 'ADMIN');
    if (!hasAdminRole) {
      await prisma.userRole.create({
        data: {
          userId: existing.id,
          role: 'ADMIN',
        },
      });
      console.log('  ✓ Added ADMIN role to existing user');
    } else {
      console.log('  ✓ User already has ADMIN role');
    }

    console.log(`  ✓ Updated existing user: ${email}`);
  } else {
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    // Assign ADMIN role (and remove auto-assigned DSPD_SUPPORT_COORDINATOR if it exists)
    await prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        role: 'ADMIN',
      },
    });

    console.log(`  ✓ Created admin user: ${email}`);
  }

  console.log('\n✅ Admin user setup complete!');
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name}`);
  console.log('\n   This user can log in via magic link and is the only user who can create other admins.');
  console.log('   To log in, use the magic link login feature with this email address.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
