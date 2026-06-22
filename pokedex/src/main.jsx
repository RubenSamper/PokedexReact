import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from '@capacitor/status-bar'

const queryClient = new QueryClient();

// Configurar StatusBar solo en entorno nativo (Android/iOS)
// eslint-disable-next-line no-undef
if (typeof Capacitor !== 'undefined') {
  StatusBar.setOverlaysWebView({ overlay: true });
  StatusBar.setStyle({ style: 'LIGHT' });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
