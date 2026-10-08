import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DiagnosticEngine } from './DiagnosticEngine.tsx';

// Suppress harmless preview websocket errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'string' && event.reason.includes('WebSocket')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <DiagnosticEngine>
    <App />
  </DiagnosticEngine>
);