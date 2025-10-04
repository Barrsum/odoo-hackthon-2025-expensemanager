// client/src/components/auth/ProtectedRoute.jsx

import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
  // In a real app, you'd also verify this token with your backend.
  // For a hackathon, checking localStorage is sufficient for the demo.
  const token = localStorage.getItem('authToken');
  return !!token; // Returns true if token exists, false otherwise
};

const ProtectedRoute = () => {
  const isAuth = useAuth();
  
  // If user is authenticated, render the nested routes (e.g., the dashboard).
  // Otherwise, redirect them to the login page.
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;