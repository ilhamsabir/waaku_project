const { Server } = require('socket.io')
const { getSecureHash } = require('./middleware/auth')
const crypto = require('crypto')

let io = null

function initSocketIO(server) {
  if (io) return io

  let WAAKU_API_KEY = (process.env.WAAKU_API_KEY || '').trim()
  if (WAAKU_API_KEY.toLowerCase().startsWith('sha512:')) {
    WAAKU_API_KEY = WAAKU_API_KEY.slice(7)
  }
  WAAKU_API_KEY = WAAKU_API_KEY.toLowerCase()
  if (!WAAKU_API_KEY) {
    const raw = (process.env.VITE_API_KEY || '').trim()
    if (/^[a-f0-9]{32}$/i.test(raw)) {
      WAAKU_API_KEY = crypto.createHash('sha512').update(raw.toLowerCase()).digest('hex')
      console.warn('[Socket AUTH] WAAKU_API_KEY not set; derived from VITE_API_KEY at runtime')
    }
  }

  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    cookie: true,
  })

  // API-key based auth only (removed UI cookie requirement)
  io.use((socket, next) => {
    try {
      const providedKey = socket.handshake.auth?.token || socket.handshake.headers['x-api-key']
      if (!providedKey || !/^[a-f0-9]{32}$/i.test(providedKey)) {
        return next(new Error('UNAUTHORIZED'))
      }
      const providedHash = getSecureHash(providedKey.toLowerCase())
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
