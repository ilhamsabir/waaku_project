const express = require('express')
const QRCode = require('qrcode')
const { createSession, listSessions, getSession, getSessionHealth, getAllSessionsHealth, deleteSession: removeSession } = require('../whatsapp/session')
const { validateNumberHandler, sendMessageHandler } = require('../controllers/message')

const router = express.Router()
const { getIO } = require('../socket')

// Create new session
router.post('/', (req, res) => {
	const { id } = req.body
	if (!id) return res.status(400).json({ error: 'id required' })
	createSession(id)
	const io = getIO()
	if (io) io.emit('sessions:update', listSessions())
	res.json({ success: true, id })
})

// List sessions
router.get('/', (req, res) => {
	res.json(listSessions())
})

// Get QR for session
router.get('/:id/qr', async (req, res) => {
	const s = getSession(req.params.id)
	if (!s) return res.status(404).json({ error: 'not found' })
	if (!s.qr) return res.json({ qr: null })
	const qrImage = await QRCode.toDataURL(s.qr)
	res.json({ qr: qrImage })
})

// Validate number (backward compatible)
router.post('/:id/validate', validateNumberHandler)

// Send message (backward compatible)
router.post('/:id/send', sendMessageHandler)

// Health check for all sessions
router.get('/health', (req, res) => {
	try {
		const healthData = getAllSessionsHealth()

		// Return appropriate HTTP status based on overall health
		const statusCode = healthData.overallHealth ? 200 : 503

		res.status(statusCode).json({
			status: healthData.overallHealth ? 'healthy' : 'unhealthy',
			...healthData
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			error: err.message,
			timestamp: new Date()
		})
	}
})

// Health check for specific session
router.get('/:id/health', (req, res) => {
	try {
		const sessionHealth = getSessionHealth(req.params.id)

		if (sessionHealth.status === 'not_found') {
			return res.status(404).json(sessionHealth)
		}

		const statusCode = sessionHealth.healthy ? 200 : 503
		res.status(statusCode).json(sessionHealth)
	} catch (err) {
		res.status(500).json({
			status: 'error',
			error: err.message,
			timestamp: new Date()
		})
	}
})

// Restart a specific session
router.post('/:id/restart', async (req, res) => {
	try {
		const session = getSession(req.params.id)
		if (!session) {
			return res.status(404).json({ error: 'Session not found' })
		}

		// Destroy existing client
		if (session.client) {
			await session.client.destroy()
		}

		// Create new session with same ID
		const newSession = createSession(req.params.id)

		res.json({
			success: true,
			message: 'Session restarted successfully',
			sessionId: req.params.id,
			timestamp: new Date()
		})
		const io = getIO()
		if (io) io.emit('sessions:update', listSessions())
	} catch (err) {
		res.status(500).json({
			error: err.message,
			timestamp: new Date()
		})
	}
})

// Delete a session
router.delete('/:id', async (req, res) => {
	try {
		const id = req.params.id
		const session = getSession(id)
		if (!session) {
			return res.status(404).json({ error: 'Session not found' })
		}
		await removeSession(id)
		res.json({ success: true, id })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

module.exports = router
