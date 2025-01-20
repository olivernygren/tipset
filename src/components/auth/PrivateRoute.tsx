// import React from 'react';
// import { Navigate } from 'react-router-dom';

// interface PrivateRouteProps {
//   children: React.ReactNode;
//   isAuthenticated: boolean;
//   isAdmin: boolean;
//   isLoading: boolean;
// }

// const PrivateRoute: React.FC<PrivateRouteProps> = ({
//   isAuthenticated, isAdmin, children, isLoading,
// }) => {
//   console.log('PrivateRoute isAuthenticated:', isAuthenticated);
//   console.log('PrivateRoute isAdmin:', isAdmin);
//   console.log('PrivateRoute isLoading:', isLoading);

//   if (isLoading) {
//     return null;
//   }

//   if (!isAuthenticated || !isAdmin) {
//     return <Navigate to="/login" />;
//   }

//   // eslint-disable-next-line react/jsx-no-useless-fragment
//   return <>{children}</>;
// };

// export default PrivateRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  isLoading, isAuthenticated, isAdmin, children,
}) => {
  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isAdmin !== undefined && !isAdmin) {
    return <Navigate to="/" />;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default PrivateRoute;
