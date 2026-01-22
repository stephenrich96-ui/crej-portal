// Script to set up primary admin and delete all other users
// Run with: tsx scripts/setup-primary-admin.ts

import { PrismaClient } from '@prisma/client';
import { createAuditLog } from '../lib/audit';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up primary administrator and cleaning up users...\n');

  const primaryAdminEmail = 'srichardson@crejllc.net';
  const primaryAdminName = 'Primary Administrator';

  // Step 1: Find or create primary admin
  console.log('Step 1: Setting up primary admin...');
  let primaryAdmin = await prisma.user.findUnique({
    where: { email: primaryAdminEmail },
    include: { roles: true },
  });

  if (primaryAdmin) {
    // Update existing user
    primaryAdmin = await prisma.user.update({
      where: { id: primaryAdmin.id },
      data: {
        name: primaryAdminName,
      },
      include: { roles: true },
    });
    console.log(`  ✓ Updated existing user: ${primaryAdminEmail}`);
  } else {
    // Create new user
    primaryAdmin = await prisma.user.create({
      data: {
        email: primaryAdminEmail,
        name: primaryAdminName,
      },
      include: { roles: true },
    });
    console.log(`  ✓ Created new user: ${primaryAdminEmail}`);
  }

  // Step 2: Ensure ADMIN role (remove all other roles first)
  console.log('\nStep 2: Setting up ADMIN role...');
  await prisma.userRole.deleteMany({
    where: { userId: primaryAdmin.id },
  });

  await prisma.userRole.create({
    data: {
      userId: primaryAdmin.id,
      role: 'ADMIN',
    },
  });
  console.log('  ✓ Assigned ADMIN role to primary admin');

  // Step 3: Delete all other users
  console.log('\nStep 3: Deleting all other users...');
  const otherUsers = await prisma.user.findMany({
    where: {
      email: { not: primaryAdminEmail },
    },
    include: {
      roles: true,
      trainingCompletions: true,
      checklistInstances: true,
    },
  });

  console.log(`  Found ${otherUsers.length} other users to delete`);

  for (const user of otherUsers) {
    // Delete user roles (cascade should handle this, but being explicit)
    await prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    // Delete training completions
    await prisma.trainingCompletion.deleteMany({
      where: { userId: user.id },
    });

    // Delete checklist instances
    await prisma.checklistInstance.deleteMany({
      where: { userId: user.id },
    });

    // Delete audit logs (set actorId to null instead of deleting)
    await prisma.auditLog.updateMany({
      where: { actorId: user.id },
      data: { actorId: null },
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(`  ✓ Deleted user: ${user.email}`);
  }

  // Step 4: Create audit log
  await createAuditLog({
    actorId: primaryAdmin.id,
    action: 'ADMIN_SETUP',
    entityType: 'User',
    entityId: primaryAdmin.id,
    metadata: { 
      action: 'setup_primary_admin',
      deletedUsers: otherUsers.length,
    },
  });

  console.log('\n✅ Setup complete!');
  console.log(`   Primary Admin: ${primaryAdminEmail}`);
  console.log(`   Name: ${primaryAdminName}`);
  console.log(`   Deleted ${otherUsers.length} other users`);
  console.log('\n   This is now the only user in the system.');
  console.log('   Log in using magic link with this email address.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
