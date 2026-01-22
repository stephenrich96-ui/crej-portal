'use client';

import { useEffect, useRef } from 'react';

interface CustomCodeBlockProps {
  code: string;
  id: string;
}

export function CustomCodeBlock({ code, id }: CustomCodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // For React/JSX code, we'd need to use a proper renderer
    // For now, we'll support HTML with dangerouslySetInnerHTML
    // In production, you might want to use a sandboxed iframe or a proper JSX renderer
    
    // Check if code contains JSX/React syntax
    const hasJSX = code.includes('className') || code.includes('{') || code.includes('</');
    
    if (hasJSX) {
      // For JSX, we'll need to parse and render it properly
      // This is a simplified version - in production, use a proper JSX parser
      console.warn('JSX code detected. Full JSX rendering requires additional setup.');
    }
  }, [code]);

  // For HTML content, render directly
  // Note: This is safe because only admins can create code blocks
  return (
    <div 
      ref={containerRef}
      className="custom-code-block"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
