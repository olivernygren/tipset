import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, isAdmin, children, isLoading }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;