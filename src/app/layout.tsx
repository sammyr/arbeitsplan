'use client';

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { StoreProvider } from '@/contexts/StoreContext'
import { ShiftProvider } from '@/contexts/ShiftContext'
import { LogProvider } from '@/contexts/LogContext'
import { Toaster } from 'react-hot-toast'
import MainLayout from '@/components/MainLayout'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

// Metadaten müssen in einer separaten Datei definiert werden, da wir 'use client' verwenden
// export const metadata: Metadata = {
//   title: 'Dienstplan Manager',
//   description: 'Effiziente Verwaltung von Arbeitszeiten und Schichten',
//   icons: {
//     icon: [
//       { url: '/favicon.svg', type: 'image/svg+xml' },
//     ],
//     shortcut: '/favicon.svg',
//     apple: '/favicon.svg',
//   },
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');
  const isPublicPage = pathname === '/' || pathname === '/home' || pathname === '/impressum' || pathname === '/datenschutz';

  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          <LogProvider>
            <StoreProvider>
              <ShiftProvider>
                <Toaster position="top-right" />
                {isAuthPage || isPublicPage ? (
                  children
                ) : (
                  <MainLayout>
                    {children}
                  </MainLayout>
                )}
              </ShiftProvider>
            </StoreProvider>
          </LogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
