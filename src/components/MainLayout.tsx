'use client';

import { useState, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import styles from '@/styles/sidebar.module.css';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // List of public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/passwort'];
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
    <div className="min-h-screen">
      {shouldShowSidebar && (
        <>
          {/* Desktop sidebar */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Dienstplan Manager"
                />
              </div>
              <Sidebar onMobileMenuClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-between">
              <div className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Dienstplan Manager"
                />
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`relative lg:hidden ${
              isMobileMenuOpen ? "" : "hidden"
            }`}
          >
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-900/80 z-40" 
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="fixed inset-0 flex z-50">
              {/* Sidebar mobile container */}
              <div className="relative flex w-full max-w-xs flex-1">
                <div className="absolute right-0 top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>

                {/* Sidebar component mobile */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-8 w-auto"
                      src="/logo.svg"
                      alt="Dienstplan Manager"
                    />
                  </div>
                  <Sidebar onMobileMenuClose={() => setIsMobileMenuOpen(false)} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className={`${shouldShowSidebar ? 'lg:pl-72' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
