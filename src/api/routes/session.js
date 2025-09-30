const express = require('express')
const QRCode = require('qrcode')
const { createSession, listSessions, getSession, getSessionHealth, getAllSessionsHealth } = require('../whatsapp/session')

const router = express.Router()

// Create new session
router.post('/', (req, res) => {
	const { id } = req.body
	if (!id) return res.status(400).json({ error: 'id required' })
	createSession(id)
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

// Validate number
router.post('/:id/validate', async (req, res) => {
	const s = getSession(req.params.id)
	if (!s || !s.ready) return res.status(400).json({ error: 'session not ready' })

	const { to } = req.body
	if (!to) return res.status(400).json({ error: 'to required' })

	try {
		const numberId = await s.client.getNumberId(to)
		if (numberId) {
			res.json({ exists: true, number: numberId.user })
		} else {
			res.json({ exists: false })
		}
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// Send message
router.post('/:id/send', async (req, res) => {
	const s = getSession(req.params.id)
	if (!s || !s.ready) return res.status(400).json({ error: 'session not ready' })

	const { to, message } = req.body
	if (!to || !message) return res.status(400).json({ error: 'to & message required' })

	try {
		const result = await s.client.sendMessage(to, message)
		res.json({ success: true, result })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

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
	} catch (err) {
		res.status(500).json({
			error: err.message,
			timestamp: new Date()
		})
	}
})

module.exports = router
