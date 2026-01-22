'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ROLES = ['ADMIN', 'DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER', 'HRSS_STAFF', 'EPAS_STAFF', 'DSP', 'TRAINER'];

export default function EditTrainingPage() {
  const router = useRouter();
  const params = useParams();
  const trainingId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    program: 'DSPD',
    videoUrl: '',
    documentUrl: '',
    contentItemId: '',
    requiredRoles: [] as string[],
  });

  useEffect(() => {
    fetch(`/api/admin/trainings/${trainingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.training) {
          setFormData({
            title: data.training.title || '',
            description: data.training.description || '',
            program: data.training.program || 'DSPD',
            videoUrl: data.training.videoUrl || '',
            documentUrl: data.training.documentUrl || '',
            contentItemId: data.training.contentItemId || '',
            requiredRoles: data.training.requirements?.map((r: any) => r.role) || [],
          });
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load training');
        setLoading(false);
      });
  }, [trainingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/trainings/${trainingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update training');
      }

      router.push('/admin/trainings');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.includes(role)
        ? prev.requiredRoles.filter(r => r !== role)
        : [...prev.requiredRoles, role],
    }));
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/admin/trainings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trainings
          </Button>
        </Link>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit Training</CardTitle>
            <CardDescription>Update training details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program *
                </label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  required
                >
                  <option value="DSPD">DSPD</option>
                  <option value="HRSS">HRSS</option>
                  <option value="EPAS">EPAS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or direct video URL"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Supports YouTube, Vimeo, or direct video URLs (.mp4, .webm, etc.)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document URL
                </label>
                <Input
                  type="url"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Link to training document (PDF, Word doc, etc.)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required For (Select At Least One Role) *
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  All trainings must be required for at least one role. Select which roles must complete this training.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`p-2 text-left border rounded ${
                        formData.requiredRoles.includes(role)
                          ? 'border-crej-primary bg-crej-light'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-sm">{role.replace(/_/g, ' ')}</span>
                    </button>
                  ))}
                </div>
                {formData.requiredRoles.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">At least one role must be selected</p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={saving || formData.requiredRoles.length === 0}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href="/admin/trainings">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
