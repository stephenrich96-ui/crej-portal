'use client';

import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

export function PHIWarningBanner() {
  return (
    <Alert variant="warning" className="mb-4 border-yellow-400 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-900 font-semibold">
        ⚠️ NO CLIENT INFORMATION OR PHI: This system is for internal staff use only. 
        Do not enter any client names, IDs, diagnoses, Medicaid numbers, dates of birth, addresses, or protected health information.
      </AlertDescription>
    </Alert>
  );
}
