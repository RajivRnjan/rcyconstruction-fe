import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  const expiry = localStorage.getItem('admin_token_expiry');

  // Check if token exists and hasn't expired
  const isAuthenticated = token && expiry && new Date().getTime() < parseInt(expiry, 10);

  if (!isAuthenticated) {
    // Optionally clear invalid tokens
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
    localStorage.removeItem('admin_user');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
