// Script to update the "Start Here" content item with full markdown
// Run with: tsx scripts/update-start-here-content.ts

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating "Start Here" content item...\n');

  // Read the markdown file
  const contentPath = join(process.cwd(), 'content/DSPD/DSPD_Support_Coordinator_Start_Here.md');
  const content = readFileSync(contentPath, 'utf-8');

  // Update the content item
  const result = await prisma.contentItem.updateMany({
    where: {
      title: 'DSPD Support Coordinator Start Here',
      program: 'DSPD',
    },
    data: {
      content,
    },
  });

  console.log(`✅ Updated ${result.count} content item(s) with full markdown content`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
