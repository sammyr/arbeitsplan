'use client';

import { Toaster } from 'react-hot-toast';
import { LogProvider } from '@/contexts/LogContext';

export default function Arbeitsplan3Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LogProvider>
        <Toaster position="top-right" />
        {children}
      </LogProvider>
    </>
  );
}
