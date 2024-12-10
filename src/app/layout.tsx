import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { StoreProvider } from '@/contexts/StoreContext'
import { ShiftProvider } from '@/contexts/ShiftContext'
import { Toaster } from 'react-hot-toast'
import MainLayout from '@/components/MainLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arbeitsplan',
  description: 'Arbeitsplan Management System',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          <StoreProvider>
            <ShiftProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </ShiftProvider>
          </StoreProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
