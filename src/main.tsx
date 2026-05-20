import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App'
import { seedIfEmpty } from './data/seed'

seedIfEmpty().then(() => {
  createRoot(document.getElementById('app')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
