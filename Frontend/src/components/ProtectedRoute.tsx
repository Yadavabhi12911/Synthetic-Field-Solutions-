import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { user, userType: currentUserType, isLoading } = useAuth();

  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - currentUserType:', currentUserType);
  console.log('ProtectedRoute - required userType:', userType);
  console.log('ProtectedRoute - isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    return <Navigate to={userType === 'admin' ? '/admin/login' : '/login'} replace />;
  }

  if (currentUserType !== userType) {
    console.log('ProtectedRoute - User type mismatch, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;