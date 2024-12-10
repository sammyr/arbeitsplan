'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // List of public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!loading) {
      if (!isPublicRoute && !user) {
        timeoutId = setTimeout(() => {
          toast.error('Bitte melden Sie sich an');
          router.push('/auth/login');
        }, 100);
      } else if (requireAdmin && userRole !== 'admin') {
        timeoutId = setTimeout(() => {
          toast.error('Sie haben keine Berechtigung für diese Seite');
          router.push('/');
        }, 100);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, loading, userRole, requireAdmin, router, isPublicRoute]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  if (!user || (requireAdmin && userRole !== 'admin')) {
    return null;
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
