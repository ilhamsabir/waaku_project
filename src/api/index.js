require('dotenv').config()
const express = require('express')
const http = require('http')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./swagger')
const sessionRoutes = require('./routes/session')
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
app.use(compression())

// Security middleware
app.use(logApiAccess)
app.use(rateLimiter)
app.use(validateApiKey)

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

// Admin endpoint to generate new API key (requires existing valid key)
app.post('/admin/generate-api-key', (req, res) => {
	try {
		const newKey = generateApiKey()

		res.json({
			success: true,
			message: 'New API key generated successfully',
			data: {
				clientKey: newKey.raw,
				serverHash: newKey.hash,
				instructions: {
					client: 'Use clientKey for X-API-Key header',
					server: 'Set WAAKU_API_KEY=' + newKey.hash + ' in environment'
				}
			}
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			error: 'Failed to generate API key',
			message: error.message
		})
	}
})

// Redirect root to API documentation
app.get('/api', (req, res) => {
	res.redirect('/api-docs')
})

// Serve API info page
app.get('/api-info', (req, res) => {
	res.sendFile(path.join(__dirname, '../../public/api-info.html'))
})

// API routes
app.use('/api/sessions', sessionRoutes)

app.use('*', (req, res) => {
	res.status(200).send(`Waaku`)
})

// Initialize Socket.IO and export via socket singleton
const io = initSocketIO(server)
module.exports.io = io

const port = Number(process.env.VITE_API_DEV_PORT || 3000)
server.listen(port, () => console.log(`Server running at http://localhost:${port}`))

server.on('error', (err) => {
	if (err && err.code === 'EADDRINUSE') {
		console.error(`\nPort ${port} is already in use.`)
		console.error('Tips:')
		console.error('- Stop the process using that port, or')
		console.error('- Run: PORT=3001 VITE_API_DEV_PORT=3001 npm run dev (or use "npm run dev:3001")')
	}
})
