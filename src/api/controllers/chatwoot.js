const { getSession, listSessions } = require('../whatsapp/session')
const { config } = require('../services')

/**
 * Chatwoot Webhook Controller
 * Handles incoming webhooks from Chatwoot for agent replies
 */

// Handle Chatwoot webhook events
async function chatwootWebhookHandler(req, res) {
	try {
		console.log('[CHATWOOT-WEBHOOK] Received webhook:', req.body)

		// Verify webhook secret if configured
		const chatwootConfig = config.getChatwootConfig()
		const receivedSecret = req.headers['x-webhook-secret'] || req.headers['authorization']

		if (chatwootConfig.webhookSecret && receivedSecret !== chatwootConfig.webhookSecret) {
			console.error('[CHATWOOT-WEBHOOK] Invalid webhook secret')
			return res.status(401).json({ error: 'Invalid webhook secret' })
		}

		const { event_type, event_data } = req.body

		// Only process message created events from agents
		if (event_type !== 'message_created') {
			console.log(`[CHATWOOT-WEBHOOK] Ignoring event type: ${event_type}`)
			return res.status(200).json({ message: 'Event ignored' })
		}

		// Check if message is from agent (outgoing)
		if (event_data.message_type !== 'outgoing') {
			console.log('[CHATWOOT-WEBHOOK] Ignoring non-outgoing message')
			return res.status(200).json({ message: 'Non-outgoing message ignored' })
		}

		// Check if message is from human agent (not bot)
		if (event_data.sender_type !== 'User') {
			console.log('[CHATWOOT-WEBHOOK] Ignoring non-human message')
			return res.status(200).json({ message: 'Non-human message ignored' })
		}

		// Extract message data
		const messageContent = event_data.content
		const conversationId = event_data.conversation?.id
		const contactPhone = event_data.conversation?.contact_inbox?.source_id

		if (!messageContent || !contactPhone) {
			console.error('[CHATWOOT-WEBHOOK] Missing required message data')
			return res.status(400).json({ error: 'Missing message content or contact phone' })
		}

		// Clean phone number and format for WhatsApp
		const cleanPhone = contactPhone.replace(/\D/g, '')
		const whatsappId = `${cleanPhone}@c.us`

		console.log(`[CHATWOOT-WEBHOOK] Processing agent reply to ${cleanPhone}: ${messageContent}`)

		// Find available session to send message
		const sessions = listSessions()
		const readySession = sessions.find(s => s.ready && s.status === 'ready')

		if (!readySession) {
			console.error('[CHATWOOT-WEBHOOK] No ready WhatsApp session available')
			return res.status(503).json({ error: 'No ready WhatsApp session available' })
		}

		// Get session and send message
		const session = getSession(readySession.id)
		if (!session || !session.client) {
			console.error('[CHATWOOT-WEBHOOK] Session client not available')
			return res.status(503).json({ error: 'Session client not available' })
		}

		// Send message via WhatsApp
		try {
			const result = await session.client.sendMessage(whatsappId, messageContent)
			console.log(`[CHATWOOT-WEBHOOK] Message sent successfully via session ${readySession.id}`)

			res.status(200).json({
				success: true,
				message: 'Agent reply sent to WhatsApp',
				data: {
					sessionId: readySession.id,
					whatsappId: whatsappId,
					conversationId: conversationId,
					messageId: result.id._serialized
				}
			})
		} catch (sendError) {
			console.error('[CHATWOOT-WEBHOOK] Error sending WhatsApp message:', sendError)
			return res.status(500).json({
				error: 'Failed to send WhatsApp message',
				details: sendError.message
			})
		}

	} catch (error) {
		console.error('[CHATWOOT-WEBHOOK] Error processing webhook:', error)
		res.status(500).json({
			error: 'Internal server error',
			details: error.message
		})
	}
}

// Health check for Chatwoot webhook endpoint
async function chatwootWebhookHealthHandler(req, res) {
	const chatwootConfig = config.getChatwootConfig()

	res.json({
		status: 'healthy',
		chatwoot_configured: chatwootConfig.isEnabled,
		webhook_endpoint: '/api/chatwoot/webhook',
		supported_events: ['message_created'],
		requirements: {
			event_type: 'message_created',
			message_type: 'outgoing',
			sender_type: 'User'
		}
	})
}

module.exports = {
	chatwootWebhookHandler,
	chatwootWebhookHealthHandler
}
