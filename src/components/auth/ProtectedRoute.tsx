// components/auth/ProtectedRoute.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireRole?: 'admin' | 'client';
}

export function ProtectedRoute({ children, requireAdmin = false, requireRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!session || !profile || !profile.active) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && profile.role !== 'admin') {
    return <Navigate to="/client" replace />;
  }

  if (requireRole && profile.role !== requireRole) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/client'} replace />;
  }

  return <>{children}</>;
}
