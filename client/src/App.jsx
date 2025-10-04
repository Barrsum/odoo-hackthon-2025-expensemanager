// client/src/App.jsx

import { Route, Routes } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPageLayout from './layouts/LandingPageLayout'

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'

// Pages
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UserManagementPage from './pages/UserManagementPage';
import ManagerAssignmentPage from './pages/ManagerAssignmentPage'; 
import ApprovalsPage from './pages/ApprovalsPage';
import MyExpensesPage from './pages/MyExpensesPage';

function App() {
  return (
    <>
      <Routes>
        {/* Public-only routes that logged-in users cannot see */}
        <Route element={<PublicRoute />}>
          
          {/* Landing Page has its own dedicated layout */}
          <Route element={<LandingPageLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          
          {/* Auth Forms have the glassmorphism layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

        </Route>

        {/* Protected routes that require login */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/manage-users" element={<UserManagementPage />} />
            <Route path="/manage-managers" element={<ManagerAssignmentPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/my-expenses" element={<MyExpensesPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors theme="dark" position="bottom-right"/>
    </>
  )
}

export default App;