const { Server } = require('socket.io')
const { getSecureHash } = require('./middleware/auth')

let io = null

function initSocketIO(server) {
  if (io) return io

  const WAAKU_API_KEY = process.env.WAAKU_API_KEY

  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    cookie: true,
  })

  // API-key based auth (UUID4 -> SHA-512 compare) + require UI cookie for dashboards
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || ''
      const hasUiCookie = /(?:^|;\s*)waaku_ui=/.test(cookieHeader)
      if (!hasUiCookie) return next(new Error('UNAUTHORIZED'))
      const providedKey = socket.handshake.auth?.token || socket.handshake.headers['x-api-key']
      if (!providedKey || !/^[a-f0-9]{32}$/.test(providedKey)) {
        return next(new Error('UNAUTHORIZED'))
      }
      const providedHash = getSecureHash(providedKey)
      if (providedHash !== WAAKU_API_KEY) {
        return next(new Error('UNAUTHORIZED'))
      }
      return next()
    } catch (e) {
      return next(new Error('UNAUTHORIZED'))
    }
  })

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log('[Socket] client connected:', socket.id)
    socket.emit('connected', { ok: true, ts: Date.now() })

    // Immediately send current sessions snapshot so UI doesn't need an initial fetch
    try {
      const { listSessions } = require('./whatsapp/session')
      socket.emit('sessions:update', listSessions())
    } catch (_) {}

    // Also send health summary
    try {
      const { getAllSessionsHealth } = require('./whatsapp/session')
      socket.emit('health:update', getAllSessionsHealth())
    } catch (_) {}
  })

  return io
}

function getIO() {
  return io
}

module.exports = { initSocketIO, getIO }
