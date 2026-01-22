'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrainingCheckboxProps {
  trainingId: string;
  isCompleted: boolean;
  completionDate?: Date | null;
}

export default function TrainingCheckbox({ trainingId, isCompleted, completionDate }: TrainingCheckboxProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const router = useRouter();

  const handleToggle = async () => {
    if (completed) {
      // Already completed - just refresh
      router.refresh();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/trainings/${trainingId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        setCompleted(true);
        router.refresh();
      } else {
        alert('Failed to mark training as complete. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
  }

  return (
    <button
      onClick={handleToggle}
      className="focus:outline-none"
      aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <Circle className="h-5 w-5 text-gray-400 hover:text-green-600 cursor-pointer" />
      )}
    </button>
  );
}
