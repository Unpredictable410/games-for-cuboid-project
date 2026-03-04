import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Worddual.css'
import App from './Worddual.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
