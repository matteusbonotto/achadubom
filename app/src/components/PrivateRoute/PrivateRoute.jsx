import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/AuthService';

const PrivateRoute = ({ children }) => {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute; 