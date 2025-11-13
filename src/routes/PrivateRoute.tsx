// src/routes/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const PrivateRoute = () => {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Carregando...</div>;
  if (!session || !profile || !profile.active) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default PrivateRoute;
