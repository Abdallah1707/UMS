import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedUserTypes = [], adminOnly = false }) => {
  const { user, loading, isFirstLogin } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force password change on first login
  if (isFirstLogin && window.location.pathname !== '/first-login-password-change') {
    return <Navigate to="/first-login-password-change" replace />;
  }

  // Check if admin only
  if (adminOnly && user.user_type !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check allowed user types
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.user_type)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;