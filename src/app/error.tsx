'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sicheres Logging des Fehlers
    if (error) {
      console.error('Application error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        digest: error.digest
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="rounded-xl bg-white p-8 text-center shadow-sm border border-slate-200 max-w-lg w-full mx-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Ein Fehler ist aufgetreten
          </h2>
          <p className="text-slate-600">
            {error?.message || 'Bitte versuchen Sie es erneut.'}
          </p>
        </div>
        
        <button
          onClick={() => {
            try {
              reset();
            } catch (e) {
              console.error('Reset failed:', e);
              window.location.reload();
            }
          }}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Neu laden
        </button>
      </div>
    </div>
  );
}
