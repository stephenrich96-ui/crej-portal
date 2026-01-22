'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

const ROLES: { value: string; label: string; description: string }[] = [
  { value: 'ADMIN', label: 'Admin', description: 'Full system access' },
  { value: 'DSPD_SUPPORT_COORDINATOR', label: 'DSPD Support Coordinator', description: 'DSPD support coordination services' },
  { value: 'DSPD_MANAGER', label: 'DSPD Manager', description: 'Manage DSPD operations and staff' },
  { value: 'HRSS_STAFF', label: 'HRSS Staff', description: 'Housing Related Support Services' },
  { value: 'EPAS_STAFF', label: 'EPAS Staff', description: 'EPAS program services' },
  { value: 'DSP', label: 'Direct Support Professional', description: 'Direct support services' },
  { value: 'TRAINER', label: 'Trainer', description: 'Training and content management' },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    if (selectedRoles.length === 0) {
      setError('Please select at least one role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set roles');
      }

      // Force a full page reload to refresh session
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Select Your Roles</CardTitle>
          <CardDescription>
            You can select multiple roles that apply to your position at CREJ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3">
              {ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role.value);
                return (
                  <button
                    key={role.value}
                    onClick={() => toggleRole(role.value)}
                                className={`p-4 text-left border-2 rounded-lg transition-all ${
                                  isSelected
                                    ? 'border-crej-primary bg-crej-light'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-600">{role.description}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-crej-primary ml-2" />
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

            <Button
              onClick={handleSubmit}
              disabled={selectedRoles.length === 0 || loading}
              className="w-full"
            >
              {loading ? 'Setting Roles...' : 'Continue'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your roles can be changed by an administrator later if needed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
