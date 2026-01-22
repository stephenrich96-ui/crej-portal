'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { isPHI } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface CreateChecklistInstanceFormProps {
  checklistId: string;
}

export default function CreateChecklistInstanceForm({ checklistId }: CreateChecklistInstanceFormProps) {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phiWarning, setPhiWarning] = useState(false);

  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (value && isPHI(value)) {
      setPhiWarning(true);
    } else {
      setPhiWarning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!label.trim()) {
      setError('Label is required');
      return;
    }

    if (phiWarning || isPHI(label) || (notes && isPHI(notes))) {
      setError('Label or notes may contain client information. Please use generic labels only (e.g., "Case #1", "Client A").');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checklists/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistId,
          label: label.trim(),
          notes: notes.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checklist instance');
      }

      const data = await response.json();
      router.push(`/checklists/${checklistId}/instances/${data.instanceId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {phiWarning && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: Label may contain client information. Use generic labels only.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
          Instance Label *
        </label>
        <Input
          id="label"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          required
          placeholder="e.g., Case #1, Client A (no name)"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-500">
          Use a generic label. Do NOT enter client names, IDs, or any PHI.
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          placeholder="Optional notes (NO CLIENT INFORMATION)"
        />
      </div>

      <Button type="submit" disabled={loading || phiWarning}>
        {loading ? 'Creating...' : 'Create Checklist Instance'}
      </Button>
    </form>
  );
}
