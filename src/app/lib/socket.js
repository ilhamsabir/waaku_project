import { io } from 'socket.io-client'
import { getApiBaseURL } from './baseUrl'

let socket

export function connectSocket() {
  if (socket && socket.connected) return socket

  const baseURL = getApiBaseURL()
  const token = import.meta.env.VITE_API_KEY

  socket = io(baseURL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('[Socket] connected', socket.id)
  })
  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('[Socket] connect_error', err.message)
  })

  return socket
}

export function on(event, handler) {
  if (!socket) connectSocket()
  socket.on(event, handler)
}

export function off(event, handler) {
  if (!socket) return
  socket.off(event, handler)
}

export function getSocket() {
  if (!socket) connectSocket()
  return socket
}
