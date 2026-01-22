'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [magicLink, setMagicLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMagicLink('');

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      if (data.magicLink) {
        // Dev mode - show link
        setMagicLink(data.magicLink);
        setMessage('Development mode: Click the link below to login');
      } else {
        setMessage('Check your email for the magic link');
      }
    } catch (err: any) {
      setMessage(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">CREJ Staff Portal</CardTitle>
          <CardDescription>Sign in with your @crejllc.net email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                {error === 'invalid_token' && 'Invalid or expired link'}
                {error === 'verification_failed' && 'Verification failed. Please try again.'}
                {!['invalid_token', 'verification_failed'].includes(error) && 'Login error'}
              </div>
            )}

            {message && (
              <div className={`p-3 border rounded text-sm ${magicLink ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                {message}
              </div>
            )}

            {magicLink && (
              <div className="p-3 bg-crej-light border border-crej-primary/20 rounded">
                <p className="text-sm text-crej-primary mb-2">Development Mode - Magic Link:</p>
                <a 
                  href={magicLink} 
                  className="text-sm text-crej-primary underline break-all"
                >
                  {magicLink}
                </a>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.name@crejllc.net"
                disabled={loading || !!magicLink}
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be a @crejllc.net email address
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !!magicLink}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
