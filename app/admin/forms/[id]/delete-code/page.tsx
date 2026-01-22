'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function DeleteCodeBlockPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [codeBlock, setCodeBlock] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    const fetchCodeBlock = async () => {
      try {
        const response = await fetch(`/api/admin/forms/code-blocks/${id}`);
        if (!response.ok) throw new Error('Failed to fetch code block');
        const data = await response.json();
        setCodeBlock(data);
      } catch (error) {
        alert('Failed to load code block');
        router.push('/admin/forms');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCodeBlock();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this code block? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/forms/code-blocks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete code block');
      }

      router.push('/admin/forms');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete code block');
      setDeleting(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/forms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-black tracking-tight">Delete Code Block</h1>
          </div>
        </div>

        <Card className="border border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-600 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Deletion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{codeBlock?.title}</strong>?
              </p>
              <p className="text-sm text-red-600 font-medium">
                This action cannot be undone. The code block will be permanently removed from all pages.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <Link href="/admin/forms">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete Code Block'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
