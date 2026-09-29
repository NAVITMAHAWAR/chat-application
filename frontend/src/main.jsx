import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { AuthProvider } from './context/AuthProvider.jsx'
import { SocketProvider } from './context/SocketContext.jsx'

axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
