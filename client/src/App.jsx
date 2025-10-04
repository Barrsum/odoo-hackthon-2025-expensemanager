// client/src/App.jsx
import { Route, Routes } from 'react-router-dom'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import AuthLayout from './layouts/AuthLayout'
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <>
      <Routes>
        {/* Routes with the Glassmorphism Layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Main App Routes (will have a different layout later) */}
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster richColors theme="dark" />
    </>
  )
}

export default App