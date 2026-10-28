

import React, { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { Navigate } from 'react-router-dom';

export const ProtecterRouter = ({ children, requireAdmin = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // User not logged in
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role?.toLowerCase() !== 'admin') {
    // User logged in but not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export const PublicRouter = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    if (user.role?.toLowerCase() === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
