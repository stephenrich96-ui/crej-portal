'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Check } from 'lucide-react';

interface TrainingLinkActionsProps {
  url: string;
  linkText?: string;
}

export function TrainingLinkActions({ url, linkText = 'Open Link' }: TrainingLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <div className="space-y-3">
      {/* URL Display with Copy */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 mb-1 font-medium">Full URL (click to copy):</p>
            <p 
              className="text-xs text-gray-800 font-mono break-all cursor-pointer hover:text-crej-primary transition-colors"
              onClick={copyToClipboard}
              title="Click to copy"
            >
              {url}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="shrink-0"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Button
            variant="default"
            size="sm"
            className="bg-crej-primary hover:bg-crej-dark"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            {linkText}
          </Button>
        </a>

        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="border-crej-primary text-crej-primary hover:bg-crej-light"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
