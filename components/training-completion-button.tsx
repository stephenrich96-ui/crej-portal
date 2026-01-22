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
        throw new Error('Failed to mark training as complete');
      }

      router.refresh();
    } catch (error) {
      console.error('Error completing training:', error);
      alert('Failed to mark training as complete');
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
