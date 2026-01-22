'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';

interface ChecklistItemCompletionButtonProps {
  checklistItemId: string;
  checklistInstanceId: string;
  isCompleted: boolean;
}

export default function ChecklistItemCompletionButton({
  checklistItemId,
  checklistInstanceId,
  isCompleted,
}: ChecklistItemCompletionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/checklists/instances/${checklistInstanceId}/items/${checklistItemId}/complete`,
        {
          method: isCompleted ? 'DELETE' : 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update completion');
      }

      router.refresh();
    } catch (error) {
      console.error('Error toggling completion:', error);
      alert('Failed to update completion');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={loading}
        className="bg-green-50 border-green-300"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {loading ? 'Updating...' : 'Completed'}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={handleToggle} disabled={loading}>
      {loading ? 'Marking...' : 'Mark Complete'}
    </Button>
  );
}
