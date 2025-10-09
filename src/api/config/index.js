/**
 * Configuration Service
 * Centralized configuration management for environment variables
 */
class ConfigService {
	constructor() {
		// Runtime configuration
		this.runtime = process.env.WAAKU_RUNTIME || 'linux'

		// Server configuration
		this.port = process.env.PORT || 3000
		this.frontendPort = process.env.FRONTEND_PORT || 1100
		this.nodeEnv = process.env.NODE_ENV || 'development'

		// API configuration
		this.apiKey = process.env.WAAKU_API_KEY
		this.viteApiKey = process.env.VITE_API_KEY

		// Webhook configuration
		this.webhook = {
			url: process.env.WEBHOOK_URL,
			secret: process.env.WEBHOOK_SECRET
		}

		// Chatwoot configuration
		this.chatwoot = {
			url: process.env.CHATWOOT_URL,
			token: process.env.CHATWOOT_TOKEN,
			accountId: process.env.ACCOUNT_ID,
			inboxId: process.env.INBOX_ID,
			webhookSecret: process.env.CHATWOOT_WEBHOOK_SECRET || process.env.VITE_API_KEY
		}

		// Puppeteer configuration
		this.puppeteer = {
			chromePath: process.env.WAAKU_CHROME_PATH,
			executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
			skipDownload: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true'
		}

		// CORS configuration
		this.corsOrigins = process.env.CORS_ORIGINS ?
			process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) :
			null
	}

	/**
	 * Check if all required configuration is present
	 */
	validate() {
		const missing = []

		if (!this.apiKey) missing.push('WAAKU_API_KEY')
		if (!this.viteApiKey) missing.push('VITE_API_KEY')

		if (missing.length > 0) {
			throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
		}

		return true
	}

	/**
	 * Get webhook configuration
	 */
	getWebhookConfig() {
		return {
			isEnabled: !!this.webhook.url,
			...this.webhook
		}
	}

	/**
	 * Get Chatwoot configuration
	 */
	getChatwootConfig() {
		return {
			isEnabled: !!(this.chatwoot.url && this.chatwoot.token && this.chatwoot.accountId && this.chatwoot.inboxId),
			...this.chatwoot
		}
	}

	/**
	 * Get Puppeteer configuration
	 */
	getPuppeteerConfig() {
		return {
			runtime: this.runtime,
			isLinux: this.runtime === 'linux',
			isMac: this.runtime === 'mac',
			...this.puppeteer
		}
	}

	/**
	 * Get server configuration
	 */
	getServerConfig() {
		return {
			port: this.port,
			frontendPort: this.frontendPort,
			nodeEnv: this.nodeEnv,
			corsOrigins: this.corsOrigins,
			isProduction: this.nodeEnv === 'production',
			isDevelopment: this.nodeEnv !== 'production'
		}
	}

	/**
	 * Get API configuration
	 */
	getApiConfig() {
		return {
			apiKey: this.apiKey,
			viteApiKey: this.viteApiKey
		}
	}

	/**
	 * Log configuration status (without sensitive data)
	 */
	logStatus() {
		console.log('[CONFIG] Configuration Status:')
		console.log(`  Runtime: ${this.runtime}`)
		console.log(`  Environment: ${this.nodeEnv}`)
		console.log(`  Port: ${this.port}`)
		console.log(`  API Key: ${this.apiKey ? '✅ Configured' : '❌ Missing'}`)
		console.log(`  Webhook: ${this.webhook.url ? '✅ Enabled' : '⚪ Disabled'}`)
		console.log(`  Chatwoot: ${this.getChatwootConfig().isEnabled ? '✅ Enabled' : '⚪ Disabled'}`)
	}
}

// Export singleton instance
module.exports = new ConfigService()
