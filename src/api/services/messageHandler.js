const ChatwootService = require('./chatwoot')
const WebhookService = require('./webhook')
const { getIO } = require('../socket')

/**
 * Message Handler Service
 * Processes incoming and outgoing WhatsApp messages
 */
class MessageHandlerService {
	constructor() {
		this.chatwootService = new ChatwootService()
		this.webhookService = new WebhookService()
	}

	/**
	 * Process incoming WhatsApp message
	 */
	async handleIncomingMessage(sessionId, message) {
		try {
			console.log(`[${sessionId}] Received message from ${message.from}: ${message.body}`)

			// Get message details
			const contact = await message.getContact()
			const chat = await message.getChat()
			const isReply = message.hasQuotedMsg

			// Prepare base message data
			const messageData = {
				sessionId,
				messageId: message.id._serialized,
				from: message.from,
				to: message.to,
				body: message.body,
				timestamp: message.timestamp,
				isReply,
				contact: {
					name: contact.name || contact.pushname || contact.number,
					number: contact.number,
					isMyContact: contact.isMyContact
				},
				chat: {
					name: chat.name,
					isGroup: chat.isGroup,
					participantCount: chat.isGroup ? chat.participants.length : null
				}
			}

			// Handle reply messages
			if (isReply) {
				const quotedMsg = await message.getQuotedMessage()
				messageData.quotedMessage = {
					id: quotedMsg.id._serialized,
					body: quotedMsg.body,
					from: quotedMsg.from,
					timestamp: quotedMsg.timestamp
				}

				// Send webhook notification for reply
				await this.webhookService.send('message_reply', messageData)

				// Emit socket event for real-time updates
				this.emitSocketEvent('message:reply', messageData)
			} else {
				// Send webhook notification for regular message
				await this.webhookService.send('message_received', messageData)

				// Emit socket event
				this.emitSocketEvent('message:received', messageData)
			}

			// Send to Chatwoot
			await this.chatwootService.handleMessage(messageData, 'incoming')

		} catch (error) {
			console.error(`[${sessionId}] Error processing incoming message:`, error)
		}
	}

	/**
	 * Process outgoing WhatsApp message (after successful send)
	 */
	async handleOutgoingMessage(sessionId, messageData) {
		try {
			console.log(`[${sessionId}] Processing outgoing message to ${messageData.to}`)

			// Send to Chatwoot
			await this.chatwootService.handleMessage({
				...messageData,
				from: messageData.to, // For outgoing, the recipient becomes the "from" in Chatwoot context
				contact: {
					name: messageData.to,
					number: messageData.to
				}
			}, 'outgoing')

		} catch (error) {
			console.error(`[${sessionId}] Error processing outgoing message:`, error)
		}
	}

	/**
	 * Emit socket event for real-time updates
	 */
	emitSocketEvent(eventName, data) {
		const io = getIO()
		if (io) {
			io.emit(eventName, data)
		}
	}
}

module.exports = MessageHandlerService
