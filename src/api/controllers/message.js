const { getSession } = require('../whatsapp/session')

// Validate number handler
async function validateNumberHandler(req, res) {
	const s = getSession(req.params.id)
	if (!s || !s.ready) return res.status(400).json({ error: 'session not ready' })

	const { to } = req.body
	if (!to) return res.status(400).json({ error: 'to required' })

	try {
		const digits = String(to).replace(/\D/g, '')
		const numberId = await s.client.getNumberId(digits)
		if (numberId) {
			res.json({ exists: true, number: numberId.user, chatId: numberId._serialized })
		} else {
			res.json({ exists: false })
		}
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

// Send message handler
async function sendMessageHandler(req, res) {
	const s = getSession(req.params.id)
	if (!s || !s.ready) return res.status(400).json({ error: 'session not ready' })

	let { to, message } = req.body
	if (!to || !message) return res.status(400).json({ error: 'to & message required' })

	// Basic normalization
	to = String(to).trim()
	message = String(message).trim()
	if (!to || !message) return res.status(400).json({ error: 'invalid to or message' })

	try {
		// If user provided a raw phone (e.g., 62812...), resolve to chatId using getNumberId
		const isChatId = /@c\.us$|@g\.us$/.test(to)
		let chatId = to

		if (!isChatId) {
			// Strip non-digits
			const digits = to.replace(/\D/g, '')
			if (!digits) return res.status(400).json({ error: 'invalid phone number' })

			const numberId = await s.client.getNumberId(digits)
			if (!numberId) {
				return res.status(400).json({ error: 'number not on WhatsApp' })
			}
			// whatsapp-web.js returns an object with _serialized usable as chatId
			chatId = numberId._serialized || `${numberId.user}@c.us`
		}

		const result = await s.client.sendMessage(chatId, message)
		res.json({ success: true, result, to: chatId })
	} catch (err) {
		console.error('[send] error sending message:', err)
		// Provide a friendlier message for common eval errors
		if (String(err?.message || '').includes('Evaluation failed')) {
			return res.status(500).json({
				error: 'Failed to send. Make sure the number is in international format (e.g., 62...) and exists on WhatsApp',
				details: err.message
			})
		}
		res.status(500).json({ error: err.message || 'unknown error' })
	}
}

module.exports = {
	validateNumberHandler,
	sendMessageHandler,
}
