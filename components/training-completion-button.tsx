'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';

interface TrainingCompletionButtonProps {
  trainingId: string;
  isCompleted: boolean;
}

export default function TrainingCompletionButton({ trainingId, isCompleted }: TrainingCompletionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trainings/${trainingId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to mark training as complete');
      }

      router.refresh();
    } catch (error: any) {
      console.error('Error completing training:', error);
      alert(error.message || 'Failed to mark training as complete. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Button variant="outline" disabled>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Completed
      </Button>
    );
  }

  return (
    <Button onClick={handleComplete} disabled={loading}>
      {loading ? 'Marking Complete...' : 'Mark as Complete'}
    </Button>
  );
}
