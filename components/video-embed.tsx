'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play } from 'lucide-react';

interface VideoEmbedProps {
  videoUrl: string;
  title?: string;
}

export function VideoEmbed({ videoUrl, title }: VideoEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo' | 'direct' | 'other' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl || videoUrl.trim() === '') {
      setError('No video URL provided');
      setVideoType('other');
      return;
    }

    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
      setVideoType('youtube');
      return;
    }

    // Check if it's a Vimeo URL
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      setEmbedUrl(`https://player.vimeo.com/video/${videoId}`);
      setVideoType('vimeo');
      return;
    }

    // Check if it's a direct video URL (ends with .mp4, .webm, etc.)
    const directVideoRegex = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
    if (directVideoRegex.test(videoUrl)) {
      setEmbedUrl(videoUrl);
      setVideoType('direct');
      return;
    }

    // If it's a web URL but not a recognized video platform, show as link
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      setVideoType('other');
      return;
    }

    // Invalid URL format
    setError('Invalid video URL format. Please use a YouTube, Vimeo, or direct video URL.');
    setVideoType('other');
  }, [videoUrl]);

  if (error) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center p-4">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-crej-primary hover:text-crej-dark"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Video Link</span>
          </a>
        </div>
      </div>
    );
  }

  if (videoType === 'youtube' || videoType === 'vimeo') {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          src={embedUrl || ''}
          title={title || 'Training Video'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === 'direct') {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full"
          src={embedUrl || ''}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // For other web URLs (password-protected or other platforms)
  return (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
      <div className="text-center p-6">
        <Play className="h-12 w-12 text-crej-primary mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-4">
          {title || 'Training Video'}
        </p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="default"
            className="bg-crej-primary hover:bg-crej-dark"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Training Video</span>
          </Button>
        </a>
        <p className="text-xs text-gray-500 mt-2">
          Video opens in a new tab
        </p>
      </div>
    </div>
  );
}
