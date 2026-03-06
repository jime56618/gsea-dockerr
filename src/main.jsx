import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- 1. Agregamos esta importación

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <-- 2. Envolvemos la App */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)