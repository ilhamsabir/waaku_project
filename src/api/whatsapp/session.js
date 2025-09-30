const { Client, LocalAuth } = require('whatsapp-web.js')

const sessions = {}

function createSession(id) {
	if (sessions[id]) return sessions[id]

	const client = new Client({
		authStrategy: new LocalAuth({ clientId: id }),
		puppeteer: {
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--no-first-run',
				'--no-zygote',
				'--single-process',
				'--disable-gpu'
			]
		},
	})

	client.on('qr', (qr) => {
		console.log(`[${id}] QR RECEIVED`)
		sessions[id].qr = qr
		sessions[id].status = 'qr_received'
		sessions[id].lastActivity = new Date()
	})

	client.on('ready', () => {
		console.log(`[${id}] Client ready!`)
		sessions[id].ready = true
		sessions[id].qr = null
		sessions[id].status = 'ready'
		sessions[id].lastActivity = new Date()
	})

	client.on('authenticated', () => {
		console.log(`[${id}] Authenticated`)
		sessions[id].status = 'authenticated'
		sessions[id].lastActivity = new Date()
	})

	client.on('auth_failure', (msg) => {
		console.log(`[${id}] Authentication failed: ${msg}`)
		sessions[id].status = 'auth_failed'
		sessions[id].error = msg
		sessions[id].lastActivity = new Date()
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
			}
		}, 30000) // Keep for 30 seconds for health check
	})

	client.on('change_state', (state) => {
		console.log(`[${id}] State changed: ${state}`)
		sessions[id].clientState = state
		sessions[id].lastActivity = new Date()
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

module.exports = { createSession, listSessions, getSession, getSessionHealth, getAllSessionsHealth }
