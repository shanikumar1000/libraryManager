import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useDemoAuth, type DemoRole } from '@/context/DemoAuthContext';

// TEMPORARY: Demo route guard for frontend testing only.
// Will be replaced by real Supabase auth guards in a future phase.

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: DemoRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, isAuthenticated } = useDemoAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    const redirect = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
