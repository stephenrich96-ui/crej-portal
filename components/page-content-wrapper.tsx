'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CustomCodeBlock } from './custom-code-block';

interface CodeBlock {
  id: string;
  code: string;
  position: string;
}


export function PageContentWrapper({ children, position }: { children: React.ReactNode; position: 'TOP' | 'MIDDLE' | 'BOTTOM' }) {
  const pathname = usePathname();
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const codeRes = await fetch(`/api/admin/forms/code-blocks?pagePath=${encodeURIComponent(pathname)}`);

        if (codeRes.ok) {
          const codeData = await codeRes.json();
          setCodeBlocks(codeData.filter((b: CodeBlock) => b.position === position));
        }
      } catch (error) {
        console.error('Error fetching page content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pathname, position]);

  if (loading) return null;

  return (
    <>
      {codeBlocks.map((block) => (
        <CustomCodeBlock key={block.id} code={block.code} id={block.id} />
      ))}
      {children}
    </>
  );
}
