const express = require('express')
const { validateNumberHandler, sendMessageHandler } = require('../controllers/message')
const {
	createSessionHandler,
	listSessionsHandler,
	getQrHandler,
	getAllHealthHandler,
	getOneHealthHandler,
	restartSessionHandler,
	deleteSessionHandler,
} = require('../controllers/session')

const router = express.Router()

// Create new session
router.post('/', createSessionHandler)

// List sessions
router.get('/', listSessionsHandler)

// Get QR for session
router.get('/:id/qr', getQrHandler)

// Validate number (backward compatible)
router.post('/:id/validate', validateNumberHandler)

// Send message (backward compatible)
router.post('/:id/send', sendMessageHandler)

// Health check for all sessions
router.get('/health', getAllHealthHandler)

// Health check for specific session
router.get('/:id/health', getOneHealthHandler)

// Restart a specific session
router.post('/:id/restart', restartSessionHandler)

// Delete a session
router.delete('/:id', deleteSessionHandler)

module.exports = router
