/**
 * Lib exports for WhatsApp Multi-Session Manager
 * Centralized exports for all library modules
 */

// HTTP Client
export { default as http } from './http.js'

// API Service
export { default as api } from './api.js'
export * from './api.js'

// Re-export commonly used functions for convenience
export {
	getSessions,
	getSessionsHealth,
	createSession,
	deleteSession,
	restartSession,
	getSessionHealth,
	generateQRCode,
	validatePhoneNumber,
	sendMessage,
	getSessionsWithHealth,
	getErrorMessage,
	isNetworkError,
	isServerError
} from './api.js'
