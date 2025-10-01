const QRCode = require('qrcode')
const {
	createSession,
	listSessions,
	getSession,
	getSessionHealth,
	getAllSessionsHealth,
	deleteSession: removeSession,
} = require('../whatsapp/session')
const { getIO } = require('../socket')

// Create new session
async function createSessionHandler(req, res) {
	const { id } = req.body
	if (!id) return res.status(400).json({ error: 'id required' })
	createSession(id)
	const io = getIO()
	if (io) io.emit('sessions:update', listSessions())
	res.json({ success: true, id })
}

// List sessions
function listSessionsHandler(req, res) {
	res.json(listSessions())
}

// Get QR for session
async function getQrHandler(req, res) {
	const s = getSession(req.params.id)
	if (!s) return res.status(404).json({ error: 'not found' })
	if (!s.qr) return res.json({ qr: null })
	const qrImage = await QRCode.toDataURL(s.qr)
	res.json({ qr: qrImage })
}

// Health check for all sessions
function getAllHealthHandler(req, res) {
	try {
		const healthData = getAllSessionsHealth()
		const statusCode = healthData.overallHealth ? 200 : 503
		res.status(statusCode).json({
			status: healthData.overallHealth ? 'healthy' : 'unhealthy',
			...healthData,
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			error: err.message,
			timestamp: new Date(),
		})
	}
}

// Health check for specific session
function getOneHealthHandler(req, res) {
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
			timestamp: new Date(),
		})
	}
}

// Restart a specific session
async function restartSessionHandler(req, res) {
	try {
		const id = req.params.id
		const session = getSession(id)
		if (!session) {
			return res.status(404).json({ error: 'Session not found' })
		}
		if (session.client) {
			await session.client.destroy()
		}
		createSession(id)
		res.json({
			success: true,
			message: 'Session restarted successfully',
			sessionId: id,
			timestamp: new Date(),
		})
		const io = getIO()
		if (io) io.emit('sessions:update', listSessions())
	} catch (err) {
		res.status(500).json({
			error: err.message,
			timestamp: new Date(),
		})
	}
}

// Delete a session
async function deleteSessionHandler(req, res) {
	try {
		const id = req.params.id
		const session = getSession(id)
		if (!session) return res.status(404).json({ error: 'Session not found' })
		await removeSession(id)
		res.json({ success: true, id })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

module.exports = {
	createSessionHandler,
	listSessionsHandler,
	getQrHandler,
	getAllHealthHandler,
	getOneHealthHandler,
	restartSessionHandler,
	deleteSessionHandler,
}
