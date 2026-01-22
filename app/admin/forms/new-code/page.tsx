'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Code, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewCodeBlockPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: `<!-- Your custom code here - branding is already applied -->
<div className="p-6 bg-crej-light rounded-lg border border-crej-primary/20">
  <h3 className="text-xl font-semibold text-crej-primary mb-4">Custom Content</h3>
  <p className="text-gray-700">Add your custom HTML/React code here.</p>
  <p className="text-sm text-gray-600 mt-2">
    You can use Tailwind classes and CREJ branding colors:
  </p>
  <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
    <li>crej-primary (olive green)</li>
    <li>crej-accent (lighter olive)</li>
    <li>crej-dark (darker olive)</li>
    <li>crej-light (light green tint)</li>
  </ul>
</div>`,
    pagePath: '',
    position: 'BOTTOM',
    order: 0,
    isActive: true,
  });

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
    setLoading(true);

    try {
      const response = await fetch('/api/admin/forms/code-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create code block');
      }

      router.push('/admin/forms');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to create code block');
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
            <h1 className="text-3xl font-semibold text-black tracking-tight">Add Custom Code Block</h1>
            <p className="mt-1 text-base text-gray-600">Create a custom code block with branding already applied</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-black">Code Block Details</CardTitle>
              <CardDescription>Configure where and how this code block appears</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Welcome Message"
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Description</label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this code block"
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
                    placeholder="e.g., /trainings, /start-here"
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to show on all pages</p>
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
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
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
                    Active (visible on pages)
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
              <CardDescription>
                Enter your HTML/React code. Branding classes are already available (crej-primary, crej-accent, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                placeholder="Enter your custom code here..."
              />
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">Available Branding Classes:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                  <div><code className="bg-blue-100 px-1 rounded">crej-primary</code> - Olive green</div>
                  <div><code className="bg-blue-100 px-1 rounded">crej-accent</code> - Lighter olive</div>
                  <div><code className="bg-blue-100 px-1 rounded">crej-dark</code> - Darker olive</div>
                  <div><code className="bg-blue-100 px-1 rounded">crej-light</code> - Light green tint</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Link href="/admin/forms">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-crej-primary hover:bg-crej-dark">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Code Block'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
