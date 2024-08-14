import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  isAuthenticated, isAdmin, children, isLoading,
}) => {
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default PrivateRoute;
