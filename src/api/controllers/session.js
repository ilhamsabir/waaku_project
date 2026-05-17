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
	res.json({ qr: qrImage, rawQr: s.qr })
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

// Get chats for session
async function getChatsHandler(req, res) {
	try {
		const s = getSession(req.params.id)
		if (!s || !s.ready) return res.status(400).json({ error: 'Session not ready' })
		
		const chats = await s.client.getChats()
		const mappedChats = chats.map(chat => ({
			id: chat.id._serialized,
			name: chat.name,
			unreadCount: chat.unreadCount,
			timestamp: chat.timestamp,
			pinned: chat.pinned,
			isGroup: chat.isGroup,
		}))
		res.json(mappedChats)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

// Get messages for a specific chat
async function getChatMessagesHandler(req, res) {
	try {
		const s = getSession(req.params.id)
		if (!s || !s.ready) return res.status(400).json({ error: 'Session not ready' })
		
		const chat = await s.client.getChatById(req.params.chatId)
		if (!chat) return res.status(404).json({ error: 'Chat not found' })
		
		const messages = await chat.fetchMessages({ limit: 50 })
		
		try {
			await chat.sendSeen();
		} catch (seenErr) {
			console.error('[sendSeen] failed to send seen:', seenErr.message);
		}

		const mappedMessages = await Promise.all(messages.map(async msg => {
			let mediaData = null;
			let mimeType = null;
			if (msg.hasMedia && (msg.type === 'image' || msg.type === 'sticker')) {
				try {
					const media = await msg.downloadMedia();
					if (media) {
						mediaData = media.data; // Base64 representation
						mimeType = media.mimetype; // e.g. "image/jpeg"
					}
				} catch (e) {
					console.error('[media] failed to download media:', e.message);
				}
			}

			let body = msg.body;
			if (msg.type === 'location') {
				const loc = msg.location;
				if (loc) {
					const lat = loc.latitude;
					const lng = loc.longitude;
					const desc = loc.description ? ` (${loc.description})` : '';
					body = `📍 Share Location${desc}:\nhttps://maps.google.com/?q=${lat},${lng}`;
				} else if (msg.body && msg.body.includes(',')) {
					body = `📍 Share Location:\nhttps://maps.google.com/?q=${msg.body}`;
				} else {
					body = `📍 Share Location`;
				}
			}

			return {
				id: msg.id._serialized,
				body: body,
				timestamp: msg.timestamp,
				from: msg.from,
				to: msg.to,
				fromMe: msg.fromMe,
				hasMedia: msg.hasMedia,
				type: msg.type,
				mediaData,
				mimeType,
			};
		}))
		res.json(mappedMessages)
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
	getChatsHandler,
	getChatMessagesHandler,
}
