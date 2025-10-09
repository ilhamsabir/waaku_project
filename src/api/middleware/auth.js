/**
 * Authentication Middleware
 * Validates X-API-Key header using UUID4 + SHA-512 system
 *
 * Security Flow:
 * 1. Generate UUID4 (without dashes) -> Client API Key
 * 2. SHA-512 hash of UUID4 -> Server stored hash
 * 3. Client sends UUID4, Server hashes and compares
 */

const crypto = require('crypto')

// Resolve API key configuration (supports multiple modes)
function resolveApiKeyConfig() {
	// Check if VITE_API_KEY is set for simple mode
	const viteApiKey = (process.env.VITE_API_KEY || '').trim()
	const waakyApiKey = (process.env.WAAKU_API_KEY || '').trim()

	if (viteApiKey && !waakyApiKey) {
		// Simple mode: use VITE_API_KEY directly
		console.log('[AUTH] Using simple API key mode (VITE_API_KEY)')
		return {
			mode: 'simple',
			key: viteApiKey
		}
	} else if (waakyApiKey) {
		// Secure mode: use SHA-512 hashing
		let key = waakyApiKey
		if (key.toLowerCase().startsWith('sha512:')) {
			key = key.slice(7)
		}
		key = key.toLowerCase()

		if (!/^[a-f0-9]{128}$/.test(key)) {
			console.error('❌ WAAKU_API_KEY must be a valid SHA-512 hash (128 hex characters)')
			process.exit(1)
		}

		console.log('[AUTH] Using secure API key mode (WAAKU_API_KEY + SHA-512)')
		return {
			mode: 'secure',
			key: key,
			rawKey: viteApiKey // for reference
		}
	} else {
		console.error('❌ Either VITE_API_KEY (simple mode) or WAAKU_API_KEY (secure mode) must be set')
		process.exit(1)
	}
}

// Initialize auth configuration
const API_CONFIG = resolveApiKeyConfig()

// Generate SHA-512 hash from raw UUID4 key
const getSecureHash = (rawKey) => {
	return crypto.createHash('sha512').update(rawKey).digest('hex')
}

/**
 * Middleware to validate X-API-Key header
 */
const validateApiKey = (req, res, next) => {
	// Skip authentication for health and docs endpoints
	const publicEndpoints = ['/health', '/api-docs', '/api', '/api-info', '/']

	if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
		return next()
	}

	const providedKey = req.headers['x-api-key']

	if (!providedKey) {
		return res.status(401).json({
			success: false,
			error: 'Missing X-API-Key header',
			message: 'API key is required for authentication',
			code: 'MISSING_API_KEY'
		})
	}

	// Validate UUID4 format (32 hex chars without dashes), case-insensitive
	if (!/^[a-f0-9]{32}$/i.test(providedKey)) {
		return res.status(401).json({
			success: false,
			error: 'Invalid X-API-Key format',
			message: 'API key must be a valid UUID4 without dashes (32 hex characters)',
			code: 'INVALID_API_KEY_FORMAT'
		})
	}

	let isValid = false

	if (API_CONFIG.mode === 'simple') {
		// Simple mode: compare raw keys directly
		const normalizedProvided = providedKey.toLowerCase()
		const normalizedStored = API_CONFIG.key.toLowerCase().replace(/-/g, '')
		isValid = normalizedProvided === normalizedStored
	} else {
		// Secure mode: hash provided key and compare with stored SHA-512 hash
		const providedKeyHash = getSecureHash(providedKey.toLowerCase())
		const providedHashBuffer = Buffer.from(providedKeyHash, 'hex')
		const storedHashBuffer = Buffer.from(API_CONFIG.key, 'hex')

		if (providedHashBuffer.length !== storedHashBuffer.length) {
			return res.status(401).json({
				success: false,
				error: 'Invalid X-API-Key',
				message: 'The provided API key is invalid',
				code: 'INVALID_API_KEY'
			})
		}

		isValid = crypto.timingSafeEqual(providedHashBuffer, storedHashBuffer)
	}

	if (!isValid) {
		return res.status(401).json({
			success: false,
			error: 'Invalid X-API-Key',
			message: 'The provided API key is invalid',
			code: 'INVALID_API_KEY'
		})
	}

	// API key is valid, continue to next middleware
	next()
}

/**
 * Generate a new UUID4 API key pair (for admin use)
 * Returns both the raw UUID4 (for client) and SHA-512 hash (for server)
 */
const generateApiKey = () => {
	const rawUuid = crypto.randomUUID().replace(/-/g, '')
	const hashedKey = crypto.createHash('sha512').update(rawUuid).digest('hex')

	return {
		raw: rawUuid,              // For client (X-API-Key header)
		hash: hashedKey,          // For server (WAAKU_API_KEY env)
		envFormat: `sha512:${hashedKey}`
	}
}

/**
 * Middleware to log API access with security details
 */
const logApiAccess = (req, res, next) => {
	const timestamp = new Date().toISOString()
	const method = req.method
	const path = req.path
	const ip = req.ip || req.connection.remoteAddress
	const userAgent = req.headers['user-agent'] || 'Unknown'
	const hasApiKey = req.headers['x-api-key'] ? '✅ Present' : '❌ Missing'

	console.log(`[API ACCESS] ${timestamp} - ${ip} ${method} ${path} | API-Key: ${hasApiKey}`)

	// Log security events
	if (!req.headers['x-api-key'] && !req.path.startsWith('/health') && !req.path.startsWith('/api-docs')) {
		console.log(`[SECURITY] Unauthorized access attempt from ${ip} - ${userAgent}`)
	}

	next()
}

/**
 * Simple rate limiting (in production, use Redis)
 */
const requestCounts = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 100 // 100 requests per minute

const rateLimiter = (req, res, next) => {
	const ip = req.ip || req.connection.remoteAddress
	const now = Date.now()

	if (!requestCounts.has(ip)) {
		requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
		return next()
	}

	const clientData = requestCounts.get(ip)

	if (now > clientData.resetTime) {
		// Reset counter
		clientData.count = 1
		clientData.resetTime = now + RATE_LIMIT_WINDOW
		return next()
	}

	if (clientData.count >= RATE_LIMIT_MAX) {
		console.log(`[SECURITY] Rate limit exceeded for ${ip}`)
		return res.status(429).json({
			success: false,
			error: 'Rate limit exceeded',
			message: 'Too many requests. Please try again later.',
			code: 'RATE_LIMIT_EXCEEDED',
			retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
		})
	}

	clientData.count++
	next()
}

module.exports = {
	validateApiKey,
	generateApiKey,
	logApiAccess,
	rateLimiter,
	getSecureHash // Export for testing
}
