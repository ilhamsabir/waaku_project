const axios = require('axios')
const config = require('../config')

/**
 * Webhook Service
 * Handles webhook notifications for message events
 */
class WebhookService {
	constructor() {
		const webhookConfig = config.getWebhookConfig()
		this.webhookUrl = webhookConfig.url
		this.webhookSecret = webhookConfig.secret
		this.isConfigured = webhookConfig.isEnabled
	}

	/**
	 * Check if webhook is configured
	 */
	isEnabled() {
		return this.isConfigured
	}

	/**
	 * Get headers for webhook requests
	 */
	getHeaders() {
		const headers = {
			'Content-Type': 'application/json',
			'User-Agent': 'Waaku-Webhook/1.0'
		}

		if (this.webhookSecret) {
			headers['X-Webhook-Secret'] = this.webhookSecret
		}

		return headers
	}

	/**
	 * Send webhook notification
	 */
	async send(eventType, data) {
		if (!this.isEnabled()) {
			console.log('[WEBHOOK] No webhook URL configured, skipping...')
			return
		}

		try {
			const payload = {
				event: eventType,
				timestamp: new Date().toISOString(),
				data
			}

			console.log(`[WEBHOOK] Sending ${eventType} to ${this.webhookUrl}`)
			const response = await axios.post(this.webhookUrl, payload, {
				headers: this.getHeaders(),
				timeout: 10000
			})

			console.log(`[WEBHOOK] ${eventType} sent successfully, status: ${response.status}`)
		} catch (error) {
			console.error(`[WEBHOOK] Failed to send ${eventType}:`, error.message)
		}
	}
}

module.exports = WebhookService
