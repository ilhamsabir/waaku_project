const { Client, LocalAuth } = require('whatsapp-web.js')
// Lazy socket accessor to avoid circular imports
const { getIO } = require('../socket')

// Environment-aware Puppeteer runtime selection
const RUNTIME = process.env.WAAKU_RUNTIME || 'linux' // 'linux' (default) | 'mac'
const isLinux = RUNTIME === 'linux'
const isMac = RUNTIME === 'mac'

function buildPuppeteerOptions() {
	const commonArgs = [
		'--no-first-run',
		'--no-default-browser-check',
		'--disable-accelerated-2d-canvas',
		'--disable-software-rasterizer',
		'--window-size=1920,1080',
	]

	const linuxArgs = [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-dev-shm-usage',
		'--disable-gpu',
		'--no-zygote',
		// Avoid sharing a user data dir across processes to prevent SingletonLock errors
		// Let Chromium pick a temp profile per process
	]

	const macArgs = [
		'--disable-gpu',
	]

	const options = {
		headless: true,
		args: [...commonArgs, ...(isLinux ? linuxArgs : macArgs)],
	}

	// Only enforce executablePath on Linux (Docker). On mac, let puppeteer resolve its Chromium
	if (isLinux) {
		options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
	} else if (process.env.WAAKU_CHROME_PATH) {
		options.executablePath = process.env.WAAKU_CHROME_PATH
	}

	console.log(`[PUPPETEER] Runtime=${RUNTIME} headless=${options.headless} exec=${options.executablePath || 'auto'}`)
	return options
}

const sessions = {}

function createSession(id) {
	if (sessions[id]) return sessions[id]

	const client = new Client({
		authStrategy: new LocalAuth({ clientId: id }),
		puppeteer: buildPuppeteerOptions(),
	})

	client.on('qr', (qr) => {
		console.log(`[${id}] QR RECEIVED`)
		sessions[id].qr = qr
		sessions[id].status = 'qr_received'
		sessions[id].lastActivity = new Date()
		const io = getIO()
		if (io) {
			// Emit as data URL for direct display on the client
			const QRCode = require('qrcode')
			QRCode.toDataURL(qr)
				.then((dataUrl) => {
					io.emit('session:qr', { id, qr: dataUrl })
					io.emit('sessions:update', listSessions())
				})
				.catch(() => {
					io.emit('session:qr', { id, qr: null })
					io.emit('sessions:update', listSessions())
				})
		}
	})

	client.on('ready', () => {
		console.log(`[${id}] Client ready!`)
		sessions[id].ready = true
		sessions[id].qr = null
		sessions[id].status = 'ready'
		sessions[id].lastActivity = new Date()
		const io = getIO()
		if (io) {
			io.emit('session:ready', { id })
			io.emit('sessions:update', listSessions())
		}
	})

	client.on('authenticated', () => {
		console.log(`[${id}] Authenticated`)
		sessions[id].status = 'authenticated'
		sessions[id].lastActivity = new Date()
		const io = getIO()
		if (io) io.emit('session:authenticated', { id })
	})

	client.on('auth_failure', (msg) => {
		console.log(`[${id}] Authentication failed: ${msg}`)
		sessions[id].status = 'auth_failed'
		sessions[id].error = msg
		sessions[id].lastActivity = new Date()
		const io = getIO()
		if (io) {
			io.emit('session:error', { id, error: msg })
			io.emit('sessions:update', listSessions())
		}
	})

	client.on('disconnected', (reason) => {
		console.log(`[${id}] Disconnected: ${reason}`)
		sessions[id].status = 'disconnected'
		sessions[id].ready = false
		sessions[id].error = reason
		sessions[id].lastActivity = new Date()
		// Don't delete immediately, keep for health check
		setTimeout(() => {
			if (sessions[id] && sessions[id].status === 'disconnected') {
				delete sessions[id]
				const io = getIO()
				if (io) io.emit('sessions:update', listSessions())
			}
		}, 30000) // Keep for 30 seconds for health check
		const io = getIO()
		if (io) io.emit('session:disconnected', { id, reason })
	})

	client.on('change_state', (state) => {
		console.log(`[${id}] State changed: ${state}`)
		sessions[id].clientState = state
		sessions[id].lastActivity = new Date()
		const io = getIO()
		if (io) io.emit('session:state', { id, state })
	})

	client.initialize()

	sessions[id] = {
		client,
		qr: null,
		ready: false,
		status: 'initializing',
		clientState: null,
		error: null,
		createdAt: new Date(),
		lastActivity: new Date()
	}
	return sessions[id]
}

function listSessions() {
	return Object.entries(sessions).map(([id, s]) => ({
		id,
		ready: s.ready,
		status: s.status,
		clientState: s.clientState,
		error: s.error,
		createdAt: s.createdAt,
		lastActivity: s.lastActivity,
		uptime: s.createdAt ? Math.floor((new Date() - s.createdAt) / 1000) : 0
	}))
}

function getSession(id) {
	return sessions[id]
}

function getSessionHealth(id) {
	const session = sessions[id]
	if (!session) {
		return { status: 'not_found', healthy: false }
	}

	const now = new Date()
	const timeSinceLastActivity = Math.floor((now - session.lastActivity) / 1000)
	const uptime = Math.floor((now - session.createdAt) / 1000)

	// Consider session unhealthy if no activity for more than 5 minutes
	const isStale = timeSinceLastActivity > 300

	// Check if session is in a good state
	const healthyStates = ['ready', 'authenticated', 'qr_received']
	const isHealthy = healthyStates.includes(session.status) && !isStale

	return {
		id,
		status: session.status,
		clientState: session.clientState,
		ready: session.ready,
		healthy: isHealthy,
		uptime,
		timeSinceLastActivity,
		error: session.error,
		createdAt: session.createdAt,
		lastActivity: session.lastActivity,
		stale: isStale
	}
}

function getAllSessionsHealth() {
	const sessionIds = Object.keys(sessions)
	const totalSessions = sessionIds.length
	const healthData = sessionIds.map(id => getSessionHealth(id))

	const healthySessions = healthData.filter(s => s.healthy).length
	const readySessions = healthData.filter(s => s.ready).length
	const staleSessions = healthData.filter(s => s.stale).length

	return {
		summary: {
			total: totalSessions,
			healthy: healthySessions,
			ready: readySessions,
			stale: staleSessions,
			unhealthy: totalSessions - healthySessions
		},
		sessions: healthData,
		timestamp: new Date(),
		overallHealth: totalSessions > 0 ? (healthySessions / totalSessions) >= 0.8 : true
	}
}

async function deleteSession(id) {
	const s = sessions[id]
	if (s && s.client) {
		try { await s.client.destroy() } catch (_) {}
	}
	delete sessions[id]
	const io = getIO()
	if (io) io.emit('sessions:update', listSessions())
	return { success: true }
}

module.exports = { createSession, listSessions, getSession, getSessionHealth, getAllSessionsHealth, deleteSession }
