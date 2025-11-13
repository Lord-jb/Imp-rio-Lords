import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type UserRole = 'admin' | 'user';

export const useRoleGuard = (requiredRole: UserRole) => {
  const { profile, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      const ok = !!(profile && profile.active && (requiredRole === 'admin' ? profile.role === 'admin' : true));
      setAuthorized(ok);
    }
  }, [profile, loading, requiredRole]);

  return { authorized, loading, role: profile?.role };
};
