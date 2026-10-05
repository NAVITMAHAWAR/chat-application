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
            gutter={12}
            containerStyle={{ top: 18, right: 18 }}
            toastOptions={{
              className: 'app-toast',
              duration: 3500,
              style: {
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 600,
                maxWidth: 'min(420px, calc(100vw - 32px))',
                padding: '15px 18px 15px 16px',
                wordBreak: 'break-word',
              },
              success: {
                className: 'app-toast app-toast--success',
                iconTheme: { primary: '#087f68', secondary: '#eaf8f2' },
              },
              error: {
                className: 'app-toast app-toast--error',
                iconTheme: { primary: '#c94f5d', secondary: '#fff0f1' },
              },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
