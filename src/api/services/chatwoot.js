const axios = require('axios')
const config = require('../config')

/**
 * Chatwoot Integration Service
 * Handles all Chatwoot API interactions for message synchronization
 */
class ChatwootService {
	constructor() {
		const chatwootConfig = config.getChatwootConfig()
		this.baseURL = chatwootConfig.url
		this.token = chatwootConfig.token
		this.accountId = chatwootConfig.accountId
		this.inboxId = chatwootConfig.inboxId
		this.isConfigured = chatwootConfig.isEnabled
	}

	/**
	 * Check if Chatwoot is properly configured
	 */
	isEnabled() {
		return this.isConfigured
	}

	/**
	 * Get default headers for Chatwoot API requests
	 */
	getHeaders() {
		return {
			'api_access_token': this.token,
			'Content-Type': 'application/json'
		}
	}

	/**
	 * Clean phone number for Chatwoot usage
	 */
	cleanPhoneNumber(phoneNumber) {
		return phoneNumber.replace('@c.us', '').replace('@g.us', '').replace(/\D/g, '')
	}

	/**
	 * Search for existing contact by phone number
	 */
	async findContact(phoneNumber) {
		if (!this.isEnabled()) {
			console.log('[CHATWOOT] Not configured, skipping contact lookup')
			return null
		}

		try {
			const cleanPhone = this.cleanPhoneNumber(phoneNumber)
			const response = await axios.get(
				`${this.baseURL}/api/v1/accounts/${this.accountId}/contacts/search`,
				{
					params: { q: cleanPhone },
					headers: this.getHeaders(),
					timeout: 10000
				}
			)

			if (response.data?.payload?.length > 0) {
				return response.data.payload[0]
			}
			return null
		} catch (error) {
			console.error('[CHATWOOT] Error searching contact:', error.message)
			return null
		}
	}

	/**
	 * Create a new contact in Chatwoot
	 */
	async createContact(contactData) {
		if (!this.isEnabled()) {
			console.log('[CHATWOOT] Not configured, skipping contact creation')
			return null
		}

		try {
			const phoneNumber = this.cleanPhoneNumber(contactData.number)
			const response = await axios.post(
				`${this.baseURL}/api/v1/accounts/${this.accountId}/contacts`,
				{
					name: contactData.name || phoneNumber,
					phone: phoneNumber,
					identifier: phoneNumber
				},
				{
					headers: this.getHeaders(),
					timeout: 10000
				}
			)

			console.log(`[CHATWOOT] Contact created: ${phoneNumber}`)
			return response.data.payload.contact
		} catch (error) {
			console.error('[CHATWOOT] Error creating contact:', error.message)
			return null
		}
	}

	/**
	 * Get or create contact
	 */
	async getOrCreateContact(contactData) {
		let contact = await this.findContact(contactData.number)
		if (!contact) {
			contact = await this.createContact(contactData)
		}
		return contact
	}

	/**
	 * Find existing conversation for a contact
	 */
	async findConversation(contactId) {
		if (!this.isEnabled()) {
			return null
		}

		try {
			const response = await axios.get(
				`${this.baseURL}/api/v1/accounts/${this.accountId}/conversations`,
				{
					params: {
						inbox_id: this.inboxId,
						status: 'open'
					},
					headers: this.getHeaders(),
					timeout: 10000
				}
			)

			const conversations = response.data.data.payload
			return conversations.find(conv => conv.meta.sender.id === contactId) || null
		} catch (error) {
			console.error('[CHATWOOT] Error fetching conversations:', error.message)
			return null
		}
	}

	/**
	 * Create a new conversation
	 */
	async createConversation(contactId) {
		if (!this.isEnabled()) {
			console.log('[CHATWOOT] Not configured, skipping conversation creation')
			return null
		}

		try {
			const response = await axios.post(
				`${this.baseURL}/api/v1/accounts/${this.accountId}/conversations`,
				{
					source_id: `whatsapp_${contactId}_${Date.now()}`,
					inbox_id: parseInt(this.inboxId),
					contact_id: contactId
				},
				{
					headers: this.getHeaders(),
					timeout: 10000
				}
			)

			console.log(`[CHATWOOT] Conversation created for contact: ${contactId}`)
			return response.data
		} catch (error) {
			console.error('[CHATWOOT] Error creating conversation:', error.message)
			return null
		}
	}

	/**
	 * Get or create conversation for a contact
	 */
	async getOrCreateConversation(contactId) {
		let conversation = await this.findConversation(contactId)
		if (!conversation) {
			conversation = await this.createConversation(contactId)
		}
		return conversation
	}

	/**
	 * Send message to Chatwoot conversation
	 */
	async sendMessage(conversationId, content, messageType = 'incoming') {
		if (!this.isEnabled()) {
			console.log('[CHATWOOT] Not configured, skipping message send')
			return null
		}

		try {
			const response = await axios.post(
				`${this.baseURL}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`,
				{
					content: content,
					message_type: messageType,
					private: false
				},
				{
					headers: this.getHeaders(),
					timeout: 10000
				}
			)

			console.log(`[CHATWOOT] Message sent to conversation ${conversationId}`)
			return response.data
		} catch (error) {
			console.error('[CHATWOOT] Error sending message:', error.message)
			return null
		}
	}

	/**
	 * Handle incoming/outgoing message and sync to Chatwoot
	 */
	async handleMessage(messageData, messageType = 'incoming') {
		if (!this.isEnabled()) {
			console.log('[CHATWOOT] Not configured, skipping message handling')
			return
		}

		try {
			const phoneNumber = this.cleanPhoneNumber(messageData.from)

			// Get or create contact
			const contact = await this.getOrCreateContact({
				name: messageData.contact?.name || phoneNumber,
				number: phoneNumber
			})

			if (!contact) {
				console.error('[CHATWOOT] Failed to get or create contact')
				return
			}

			// Get or create conversation
			const conversation = await this.getOrCreateConversation(contact.id)
			if (!conversation) {
				console.error('[CHATWOOT] Failed to get or create conversation')
				return
			}

			// Prepare message content
			let content = messageData.body || messageData.message
			if (messageData.isReply && messageData.quotedMessage) {
				content = `[Reply to: "${messageData.quotedMessage.body}"]\n\n${content}`
			}

			// Send message to Chatwoot
			await this.sendMessage(conversation.id, content, messageType)

			console.log(`[CHATWOOT] Successfully processed ${messageType} message from ${phoneNumber}`)
		} catch (error) {
			console.error('[CHATWOOT] Error handling message:', error.message)
		}
	}
}

module.exports = ChatwootService
