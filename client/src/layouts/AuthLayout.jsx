// client/src/layouts/AuthLayout.jsx
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Outlet is where the child route (e.g., SignupPage or LoginPage) will be rendered */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;