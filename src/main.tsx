import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Optional: allow disabling SW via query param for troubleshooting
const params = new URLSearchParams(window.location.search)
if (params.get('sw') === 'off' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister())
    // Clear caches as well
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)))
    }
  }).finally(() => {
    // Remove the param and reload cleanly
    const url = new URL(window.location.href)
    url.searchParams.delete('sw')
    window.location.replace(url.toString())
  })
}

// Minimal production error overlay to surface silent runtime errors
function attachRuntimeErrorOverlay() {
  const ensureBanner = () => {
    let el = document.getElementById('runtime-error-banner')
    if (!el) {
      el = document.createElement('div')
      el.id = 'runtime-error-banner'
      el.style.position = 'fixed'
      el.style.bottom = '12px'
      el.style.left = '12px'
      el.style.right = '12px'
      el.style.zIndex = '9999'
      el.style.background = 'rgba(220,38,38,0.95)'
      el.style.color = 'white'
      el.style.padding = '10px 12px'
      el.style.borderRadius = '8px'
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
      el.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"'
      el.style.fontSize = '14px'
      el.style.display = 'none'
      document.body.appendChild(el)
    }
    return el
  }
  const show = (msg: string) => {
    const el = ensureBanner()
    el.textContent = `Runtime error: ${msg}`
    el.style.display = 'block'
  }
  window.addEventListener('error', (e) => {
    console.error('[runtime-error]', e.error || e.message)
    show(String(e.error?.message || e.message || 'Unknown error'))
  })
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[unhandled-rejection]', e.reason)
    const msg = typeof e.reason === 'string' ? e.reason : (e.reason?.message || 'Unknown promise rejection')
    show(String(msg))
  })
}

attachRuntimeErrorOverlay()

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  // Fallback rendering
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <h2 class="text-xl font-bold text-red-600 mb-4">Application Error</h2>
          <p class="text-gray-700 mb-4">Failed to initialize the application.</p>
          <button onclick="window.location.reload()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Reload Page
          </button>
        </div>
      </div>
    `
  }
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
