'use client';

import { useState, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import styles from '@/styles/sidebar.module.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // List of public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.replace('/auth/login');
    }
  }, [loading, user, isPublicRoute, router]);

  // Don't show sidebar on public routes or when not authenticated
  const shouldShowSidebar = !isPublicRoute && user;

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  }, [isMobileMenuOpen]);

  if (loading && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log('MainLayout Debug:', {
    currentPath: pathname,
    isPublicRoute,
    userExists: !!user,
    shouldShowSidebar,
    loading
  });

  return (
    <div className="relative">
      <div className="flex min-h-screen">
        {shouldShowSidebar && (
          <>
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6 text-slate-600" aria-hidden="true" />
            </button>

            {/* Dark background on mobile */}
            <div
              className={`
                fixed inset-0 bg-black/30 lg:hidden
                ${isMobileMenuOpen ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none'}
                transition-opacity duration-300
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <div
              className={`
                fixed top-0 left-0 bottom-0 z-50
                w-[280px] bg-white shadow-xl
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:shadow-none
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
            >
              <nav className="h-full">
                <div className="h-full overflow-y-auto">
                  <div className="px-4 py-5">
                    <Sidebar onMobileMenuClose={() => setIsMobileMenuOpen(false)} />
                  </div>
                </div>
              </nav>
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 bg-slate-50">
          <div className={`mx-auto max-w-7xl ${shouldShowSidebar ? 'lg:pl-[280px]' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
