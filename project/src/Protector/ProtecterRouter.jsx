

import React, { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { Navigate } from 'react-router-dom';

export const ProtecterRouter = ({ children, requireAdmin = false }) => {
  const { user } = useContext(AuthContext);

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
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
