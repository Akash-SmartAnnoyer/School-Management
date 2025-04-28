import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../utils/tokenManager';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const currentUser = getCurrentUser();

  if (!isAuthenticated()) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role?.toLowerCase())) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute; 