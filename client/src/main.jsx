// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider.jsx' // <-- Import this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark"> {/* <-- Add this wrapper */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)