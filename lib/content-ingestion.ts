import fs from 'fs';
import path from 'path';
// ContentCategory and ContentProgram are now strings

export interface ParsedMarkdown {
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  category: string;
  program: string;
  filePath: string;
}

/**
 * Parse markdown file and extract metadata
 */
export function parseMarkdownFile(filePath: string, content: string): ParsedMarkdown {
  const fileName = path.basename(filePath, '.md');
  
  // Extract title from first H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  const title = h1Match ? h1Match[1].trim() : fileName.replace(/_/g, ' ').replace(/-/g, ' ');

  // Extract summary from first paragraph after H1
  let summary: string | null = null;
  const afterH1 = content.split(/^#\s+.+$/m)[1];
  if (afterH1) {
    const firstParagraph = afterH1.trim().split('\n\n')[0];
    if (firstParagraph && firstParagraph.length > 0) {
      summary = firstParagraph.substring(0, 200).trim();
      if (summary.length === 200) summary += '...';
    }
  }

  // Determine category from filename
  const category = determineCategory(fileName);

  // Determine program from folder
  const program = determineProgram(filePath);

  const slug = slugify(title);

  return {
    title,
    slug,
    summary,
    content,
    category,
    program,
    filePath,
  };
}

/**
 * Determine content category from filename patterns
 */
function determineCategory(fileName: string): string {
  const lower = fileName.toLowerCase();
  
  if (lower.includes('onboarding')) return 'ONBOARDING';
  if (lower.includes('sop') || lower.includes('procedure')) return 'SOPS';
  if (lower.includes('training') || lower.includes('resource_library')) return 'TRAININGS';
  if (lower.includes('checklist') || lower.includes('action_items')) return 'COMPLIANCE_CHECKLISTS';
  if (lower.includes('index') || lower.includes('master') || lower.includes('guide')) return 'REFERENCE';
  
  return 'REFERENCE'; // Default
}

/**
 * Determine program from file path
 */
function determineProgram(filePath: string): string {
  if (filePath.includes('/DSPD/')) return 'DSPD';
  if (filePath.includes('/HRSS/')) return 'HRSS';
  if (filePath.includes('/EPAS/')) return 'EPAS';
  
  return 'DSPD'; // Default
}

/**
 * Scan content directory and parse all markdown files
 */
export function scanContentDirectory(contentDir: string = './content'): ParsedMarkdown[] {
  const results: ParsedMarkdown[] = [];
  
  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) {
      console.warn(`Content directory not found: ${dir}`);
      return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const parsed = parseMarkdownFile(fullPath, content);
          results.push(parsed);
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error);
        }
      }
    }
  }

  scanDir(contentDir);
  return results;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
