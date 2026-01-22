import { PrismaClient } from '@prisma/client';
import { scanContentDirectory } from '../lib/content-ingestion';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Syncing content from markdown files...');

  const parsedFiles = scanContentDirectory();

  console.log(`📄 Found ${parsedFiles.length} markdown files`);

  for (const parsed of parsedFiles) {
    try {
      const existing = await prisma.contentItem.findUnique({
        where: { slug: parsed.slug },
      });

      if (existing && existing.isFromFile) {
        await prisma.contentItem.update({
          where: { slug: parsed.slug },
          data: {
            title: parsed.title,
            summary: parsed.summary,
            content: parsed.content,
            category: parsed.category,
            program: parsed.program,
            filePath: parsed.filePath,
          },
        });
        console.log(`  ✓ Updated: ${parsed.title}`);
      } else if (!existing) {
        await prisma.contentItem.create({
          data: {
            title: parsed.title,
            slug: parsed.slug,
            summary: parsed.summary,
            content: parsed.content,
            category: parsed.category,
            program: parsed.program,
            filePath: parsed.filePath,
            isFromFile: true,
          },
        });
        console.log(`  ✓ Created: ${parsed.title}`);
      }
    } catch (error) {
      console.error(`  ✗ Error processing ${parsed.filePath}:`, error);
    }
  }

  console.log('✨ Content sync complete!');
}

main()
  .catch((e) => {
    console.error('Error syncing content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
