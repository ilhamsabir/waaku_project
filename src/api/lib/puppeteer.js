const config = require('../config')

/**
 * Puppeteer Configuration Service
 * Handles platform-specific Puppeteer options for WhatsApp sessions
 */
class PuppeteerService {
	constructor() {
		const puppeteerConfig = config.getPuppeteerConfig()
		this.runtime = puppeteerConfig.runtime
		this.isLinux = puppeteerConfig.isLinux
		this.isMac = puppeteerConfig.isMac
		this.chromePath = puppeteerConfig.chromePath
		this.executablePath = puppeteerConfig.executablePath
	}

	/**
	 * Get common Puppeteer arguments
	 */
	getCommonArgs() {
		return [
			'--no-first-run',
			'--no-default-browser-check',
			'--disable-accelerated-2d-canvas',
			'--disable-software-rasterizer',
			'--window-size=1920,1080',
		]
	}

	/**
	 * Get Linux-specific Puppeteer arguments
	 */
	getLinuxArgs() {
		return [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu',
			'--no-zygote',
		]
	}

	/**
	 * Get macOS-specific Puppeteer arguments
	 */
	getMacArgs() {
		return [
			'--disable-gpu',
			'--disable-dev-shm-usage',
			'--disable-setuid-sandbox',
			'--no-first-run',
			'--no-default-browser-check',
		]
	}

	/**
	 * Get platform-specific executable path
	 */
	getExecutablePath() {
		if (this.isLinux) {
			return this.executablePath || '/usr/bin/chromium-browser'
		} else if (this.isMac) {
			return this.chromePath || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
		}
		return undefined
	}

	/**
	 * Build complete Puppeteer options based on runtime
	 */
	buildOptions() {
		const options = {
			headless: true,
			args: [
				...this.getCommonArgs(),
				...(this.isLinux ? this.getLinuxArgs() : this.getMacArgs())
			],
		}

		const executablePath = this.getExecutablePath()
		if (executablePath) {
			options.executablePath = executablePath
		}

		console.log(`[PUPPETEER] Runtime=${this.runtime} headless=${options.headless} exec=${executablePath || 'auto'}`)
		return options
	}
}

module.exports = PuppeteerService
