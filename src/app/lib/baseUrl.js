// Helper to compute a safe API base URL for both HTTP and Socket.IO
// Prefers the current window origin; if VITE_API_BASE_URL is provided and safe,
// uses that. Avoids using localhost when the app isn't served from localhost to
// prevent CSP and cross-origin issues in production.

function isLocalhost(hostname) {
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
}

export function getApiBaseURL() {
  const isBrowser = typeof window !== 'undefined'
  const winOrigin = isBrowser ? window.location.origin : 'http://localhost:3000'
  const configuredBase = import.meta.env.VITE_API_BASE_URL

  let baseURL = winOrigin
  if (configuredBase && configuredBase.trim().length > 0 && isBrowser) {
    try {
      const u = new URL(configuredBase, winOrigin)
      const isCfgLocal = isLocalhost(u.hostname)
      const isWinLocal = isLocalhost(window.location.hostname)
      // If config points to localhost but app isn't served from localhost, ignore it
      if (!(isCfgLocal && !isWinLocal)) {
        baseURL = u.origin
      }
    } catch (e) {
      // Ignore invalid URL and keep default
    }
  }
  return baseURL
}
