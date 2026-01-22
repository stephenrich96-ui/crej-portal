'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Code, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditCodeBlockPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    pagePath: '',
    position: 'BOTTOM',
    order: 0,
    isActive: true,
  });

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
        setFormData({
          title: data.title,
          description: data.description || '',
          code: data.code,
          pagePath: data.pagePath || '',
          position: data.position,
          order: data.order,
          isActive: data.isActive,
        });
      } catch (error) {
        alert('Failed to load code block');
        router.push('/admin/forms');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCodeBlock();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      ...(name === 'order' ? { order: parseInt(value) || 0 } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/forms/code-blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update code block');
      }

      router.push('/admin/forms');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to update code block');
      setSaving(false);
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
            <h1 className="text-3xl font-semibold text-black tracking-tight">Edit Custom Code Block</h1>
            <p className="mt-1 text-base text-gray-600">Update your custom code block</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-black">Code Block Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Description</label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Page Path (Optional)</label>
                  <Input
                    name="pagePath"
                    value={formData.pagePath}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TOP">Top of Page</option>
                    <option value="MIDDLE">Middle of Page</option>
                    <option value="BOTTOM">Bottom of Page</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Order</label>
                  <Input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    className="bg-white"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-crej-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-black">
                    Active
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-black flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Custom Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Link href="/admin/forms">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving} className="bg-crej-primary hover:bg-crej-dark">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
