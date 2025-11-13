// src/routes/RoleRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/hooks/useAuth';

const RoleRoute = ({ role, children }: { role: UserRole; children: ReactNode }) => {
  const { profile } = useAuth();
  if (!profile) return null;
  if (profile.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default RoleRoute;
