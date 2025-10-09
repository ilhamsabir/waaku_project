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
	 * Search for existing contact by phone number (DISABLED)
	 */
	async findContact(phoneNumber) {
		console.log('[CHATWOOT] Contact search disabled - returning null')
		return null
	}

	/**
	 * Create a new contact in Chatwoot (DISABLED)
	 */
	async createContact(contactData) {
		console.log('[CHATWOOT] Contact creation disabled - returning null')
		return null
	}

	/**
	 * Get or create contact (DISABLED)
	 */
	async getOrCreateContact(contactData) {
		console.log('[CHATWOOT] Contact management disabled - returning null')
		return null
	}

	/**
	 * Find existing conversation for a contact (DISABLED)
	 */
	async findConversation(contactId) {
		console.log('[CHATWOOT] Conversation search disabled - returning null')
		return null
	}

	/**
	 * Create a new conversation (DISABLED)
	 */
	async createConversation(contactId) {
		console.log('[CHATWOOT] Conversation creation disabled - returning null')
		return null
	}

	/**
	 * Get or create conversation for a contact (DISABLED)
	 */
	async getOrCreateConversation(contactId) {
		console.log('[CHATWOOT] Conversation management disabled - returning null')
		return null
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
	 * Get messages from Chatwoot conversation
	 */
	async getMessages(conversationId, page = 1) {
		if (!this.isEnabled()) {
			console.log('[CHATWOOT] Not configured, skipping message retrieval')
			return null
		}

		try {
			const response = await axios.get(
				`${this.baseURL}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`,
				{
					params: { page },
					headers: this.getHeaders(),
					timeout: 10000
				}
			)

			console.log(`[CHATWOOT] Retrieved messages from conversation ${conversationId}`)
			return response.data
		} catch (error) {
			console.error('[CHATWOOT] Error getting messages:', error.message)
			return null
		}
	}

	/**
	 * Get conversation details
	 */
	async getConversation(conversationId) {
		if (!this.isEnabled()) {
			console.log('[CHATWOOT] Not configured, skipping conversation retrieval')
			return null
		}

		try {
			const response = await axios.get(
				`${this.baseURL}/api/v1/accounts/${this.accountId}/conversations/${conversationId}`,
				{
					headers: this.getHeaders(),
					timeout: 10000
				}
			)

			console.log(`[CHATWOOT] Retrieved conversation ${conversationId}`)
			return response.data
		} catch (error) {
			console.error('[CHATWOOT] Error getting conversation:', error.message)
			return null
		}
	}

	/**
	 * Send quick message to conversation (simplified version)
	 */
	async quickSendMessage(conversationId, content) {
		return await this.sendMessage(conversationId, content, 'outgoing')
	}

	/**
	 * Handle incoming/outgoing message and sync to Chatwoot (SIMPLIFIED)
	 * Contact and conversation management disabled - manual conversation ID required
	 */
	async handleMessage(messageData, conversationId, messageType = 'incoming') {
		if (!this.isEnabled()) {
			console.log('[CHATWOOT] Not configured, skipping message handling')
			return
		}

		if (!conversationId) {
			console.log('[CHATWOOT] No conversation ID provided - contact/conversation management disabled')
			return
		}

		try {
			// Prepare message content
			let content = messageData.body || messageData.message
			if (messageData.isReply && messageData.quotedMessage) {
				content = `[Reply to: "${messageData.quotedMessage.body}"]\n\n${content}`
			}

			// Send message to Chatwoot with provided conversation ID
			await this.sendMessage(conversationId, content, messageType)

			const phoneNumber = this.cleanPhoneNumber(messageData.from || 'unknown')
			console.log(`[CHATWOOT] Successfully processed ${messageType} message from ${phoneNumber} to conversation ${conversationId}`)
		} catch (error) {
			console.error('[CHATWOOT] Error handling message:', error.message)
		}
	}
}

module.exports = ChatwootService
