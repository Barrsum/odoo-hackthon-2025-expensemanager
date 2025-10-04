// client/src/App.jsx

import { Route, Routes } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPageLayout from './layouts/LandingPageLayout' // <-- Import new layout

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <>
      <Routes>
        {/* Route 1: The Public Landing Page with its own layout */}
        <Route element={<LandingPageLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Route 2: Public Auth Forms with the glassmorphism layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Route 3: Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors theme="dark" position="bottom-right"/>
    </>
  )
}

export default App