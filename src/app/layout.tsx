import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import { StoreProvider } from '@/contexts/StoreContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Arbeitsplan Manager',
  description: 'Verwalten Sie Ihren Arbeitsplan effizient',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full bg-gray-100">
      <body className={`${inter.className} h-full`}>
        <StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:pl-72 pt-16 lg:pt-0">
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
