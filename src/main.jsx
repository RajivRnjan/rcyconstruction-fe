import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Prevent global scroll on number inputs from changing their value
document.addEventListener('wheel', function(event) {
  if (document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
