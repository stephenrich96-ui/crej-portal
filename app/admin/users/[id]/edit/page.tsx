'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const ROLES = ['ADMIN', 'DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER', 'HRSS_STAFF', 'EPAS_STAFF', 'DSP', 'TRAINER'];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setSelectedRoles(data.user.roles?.map((r: any) => r.role) || []);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load user');
        setLoading(false);
      });
  }, [userId]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      router.push('/admin/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit User Roles</CardTitle>
            <CardDescription>
              {user?.email} - Select roles for this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-3">
                {ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`p-4 text-left border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-crej-primary bg-crej-light'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {role.replace(/_/g, ' ')}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-crej-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedRoles.length > 0 && (
                <div className="p-3 bg-crej-light border border-crej-primary/20 rounded-lg">
                  <p className="text-sm text-crej-primary">
                    <strong>Selected:</strong> {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
                <Button type="submit" disabled={saving || selectedRoles.length === 0}>
                  {saving ? 'Saving...' : 'Save Roles'}
                </Button>
                <Link href="/admin/users">
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
