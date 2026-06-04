import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppFeedbackProvider } from './components/AppFeedback.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppFeedbackProvider>
      <App />
    </AppFeedbackProvider>
  </StrictMode>,
)
