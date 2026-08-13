import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    // Preserve token from query string if checking in
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    if (token) {
      sessionStorage.setItem('pending_qr_token', token);
    }
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === 'student' && profile?.role === 'admin' && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};
