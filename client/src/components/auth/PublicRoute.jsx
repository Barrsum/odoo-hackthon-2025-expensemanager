// client/src/components/auth/PublicRoute.jsx

import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

const PublicRoute = () => {
  const isAuth = useAuth();
  // If user is logged in, redirect to dashboard. Otherwise, show the public page.
  return isAuth ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;