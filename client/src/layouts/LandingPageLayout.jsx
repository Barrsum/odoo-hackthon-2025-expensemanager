// client/src/layouts/LandingPageLayout.jsx

import { Outlet } from "react-router-dom";

const LandingPageLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default LandingPageLayout;