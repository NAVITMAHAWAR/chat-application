import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { AuthProvider } from './context/AuthProvider.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { Toaster } from 'react-hot-toast'

axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                border: '1px solid #e3e9e6',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#17211f',
                fontSize: '14px',
                boxShadow: '0 12px 32px rgba(20, 50, 39, 0.12)',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#087f68', secondary: '#ffffff' } },
              error: { iconTheme: { primary: '#d85f5f', secondary: '#ffffff' } },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
