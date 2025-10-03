require('dotenv').config()
const express = require('express')
const http = require('http')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const helmet = require('helmet')
const compression = require('compression')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./swagger')
const sessionRoutes = require('./routes/session')
const messageRoutes = require('./routes/messages')
const { validateApiKey, logApiAccess, rateLimiter, generateApiKey } = require('./middleware/auth')
const { initSocketIO } = require('./socket')

const app = express()
const server = http.createServer(app)

// Security and performance middleware
app.use(helmet({
	crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// Configurable CORS (comma-separated origins in CORS_ORIGINS), defaults to allow all
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : '*'
const corsOptions = corsOrigins === '*' ? {} : { origin: corsOrigins, credentials: true }
app.use(cors(corsOptions))

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(compression())

// Security middleware
app.use(logApiAccess)
app.use(rateLimiter)

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
	explorer: true,
	customCss: '.swagger-ui .topbar { display: none }',
	customSiteTitle: 'WhatsApp Multi-Session API Documentation',
	swaggerOptions: {
		persistAuthorization: true,
		displayRequestDuration: true,
		docExpansion: 'list',
		filter: true,
	}
}))

// General health endpoint
app.get('/health', (req, res) => {
	res.json({
		status: 'healthy',
		service: 'WhatsApp Multi-Session Manager',
		timestamp: new Date(),
		uptime: process.uptime(),
		memory: process.memoryUsage(),
		version: process.env.npm_package_version || '1.0.0',
		security: {
			apiKeyFormat: 'UUID4 + SHA-512',
			rateLimiting: 'Active',
			authentication: 'Required'
		}
	})
})

// Redirect root to API documentation
app.get('/api', (req, res) => {
	res.redirect('/api-docs')
})

// Simple cookie-based UI auth (optional). In production use a proper session store.
const UI_COOKIE_NAME = 'waaku_ui'
const UI_COOKIE_OPTS = {
	httpOnly: true,
	sameSite: 'lax',
	secure: process.env.NODE_ENV === 'production',
	maxAge: 60 * 60 * 8, // 8h
}

function credentialsValid(user, pass) {
	const u = process.env.VITE_AUTH_USER || ''
	const p = process.env.VITE_AUTH_PASS || ''
	if (!u || !p) return false
	if (p.startsWith('bcrypt:')) {
		const hash = p.replace(/^bcrypt:/, '')
		console.log('hash: ', hash);
		return user === u && bcrypt.compareSync(pass, hash)
	}
	return user === u && pass === p
}

app.post('/auth/login', (req, res) => {
	const { username, password } = req.body || {}
	if (!username || !password) return res.status(400).json({ ok: false, error: 'Missing credentials' })
	if (!credentialsValid(username, password)) return res.status(401).json({ ok: false, error: 'Invalid credentials' })
	res.cookie(UI_COOKIE_NAME, '1', UI_COOKIE_OPTS)
	res.json({ ok: true })
})

app.post('/auth/logout', (req, res) => {
	res.clearCookie(UI_COOKIE_NAME, UI_COOKIE_OPTS)
	res.json({ ok: true })
})

app.get('/auth/me', (req, res) => {
	const authed = !!req.cookies[UI_COOKIE_NAME]
	res.json({ ok: true, authenticated: authed })
})

// API routes (protected by API key)
app.use('/api', validateApiKey)
app.use('/api/sessions', sessionRoutes)
app.use('/api/messages', messageRoutes)

// Serve built frontend (Vite dist) in production
const frontendDir = path.resolve(__dirname, '../../dist')
app.use(express.static(frontendDir, { maxAge: '1h', index: false }))

// SPA fallback: send index.html for non-API routes
// Exclude socket.io, api-docs, and health endpoints
app.get(/^\/(?!api|api-docs|health|socket\.io).*/, (req, res) => {
	res.sendFile(path.join(frontendDir, 'index.html'))
})

// Initialize Socket.IO and export via socket singleton
const io = initSocketIO(server)
module.exports.io = io

const port = Number(process.env.PORT || process.env.VITE_API_DEV_PORT || 4300)
server.listen(port, () => console.log(`Server running at http://localhost:${port}`))

server.on('error', (err) => {
	if (err && err.code === 'EADDRINUSE') {
		console.error(`\nPort ${port} is already in use.`)
		console.error('Tips:')
		console.error('- Stop the process using that port, or')
		console.error('- Run: PORT=4301 VITE_API_DEV_PORT=4301 npm run dev (or use "npm run dev:4301")')
	}
})
