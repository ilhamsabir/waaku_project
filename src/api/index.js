require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./swagger')
const sessionRoutes = require('./routes/session')

const app = express()
app.use(cors())
app.use(bodyParser.json())

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
		version: process.env.npm_package_version || '1.0.0'
	})
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

// Check if dist folder exists, if not serve development fallback
const fs = require('fs')
const distPath = path.join(__dirname, '../../dist')
const distIndexPath = path.join(distPath, 'index.html')

// Serve frontend build (dist) - but only for non-API routes
if (fs.existsSync(distPath)) {
	app.use(express.static(distPath))
} else {
	console.warn('⚠️  Dist folder not found. Running in API-only mode.')
	console.warn('💡 Run "npm run build" to generate frontend assets.')
}

// Catch-all handler: send back index.html file for frontend routes
app.get('*', (req, res) => {
	// Don't interfere with API routes
	if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
		return res.status(404).json({ error: 'API endpoint not found' })
	}

	// Serve public/index.html as main frontend
	const publicIndexPath = path.join(__dirname, '../../public/index.html')
	if (fs.existsSync(publicIndexPath)) {
		res.sendFile(publicIndexPath)
	} else if (fs.existsSync(distIndexPath)) {
		// Fallback to built frontend if exists
		res.sendFile(distIndexPath)
	} else {
		// Last fallback: development page
		const fallbackPath = path.join(__dirname, '../../public/fallback.html')
		if (fs.existsSync(fallbackPath)) {
			res.sendFile(fallbackPath)
		} else {
			// Last resort: simple JSON response
			res.status(200).json({
				message: 'WhatsApp Multi-Session API',
				status: 'running',
				mode: 'api-only',
				frontend: 'not-built',
				documentation: '/api-docs',
				health: '/health',
				sessions: '/api/sessions',
				build_command: 'npm run build'
			})
		}

	}
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
