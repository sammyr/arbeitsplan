'use client';

import { Toaster } from 'react-hot-toast';

export default function Arbeitsplan3Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
}
