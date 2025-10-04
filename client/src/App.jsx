// client/src/App.jsx
import { Route, Routes } from 'react-router-dom'
import SignupPage from './pages/SignupPage' // We will create this next
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <>
      <main>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          {/* We will add more routes here later, like /login and /dashboard */}
        </Routes>
      </main>
      <Toaster richColors /> {/* This component will display our notifications */}
    </>
  )
}

export default App