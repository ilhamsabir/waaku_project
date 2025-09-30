import axios from 'axios'

// Get API base URL and API key from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_API_KEY

if (!API_KEY) {
	console.error('❌ VITE_API_KEY not found in environment variables!')
}

// Create axios instance with default configuration
const http = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000, // 30 seconds timeout
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'X-API-Key': API_KEY,
	},
})

// Request interceptor for logging and ensuring API key is present
http.interceptors.request.use(
	(config) => {
		// Ensure API key is always present
		if (API_KEY && !config.headers['X-API-Key']) {
			config.headers['X-API-Key'] = API_KEY
		}

		// Log request in development
		if (import.meta.env.DEV) {
			console.log(`🚀 [HTTP] ${config.method?.toUpperCase()} ${config.url}`)
			console.log(`🔑 [HTTP] API Key: ${API_KEY ? '✅ Present' : '❌ Missing'}`)
		}
		return config
	},
	(error) => {
		console.error('❌ [HTTP] Request Error:', error)
		return Promise.reject(error)
	}
)

// Response interceptor for error handling
http.interceptors.response.use(
	(response) => {
		// Log response in development
		if (import.meta.env.DEV) {
			console.log(`✅ [HTTP] ${response.status} ${response.config.url}`)
		}
		return response
	},
	(error) => {
		// Enhanced error logging
		if (error.response) {
			console.error(`❌ [HTTP] ${error.response.status} ${error.response.config?.url}`)

			// Handle API key authentication errors
			if (error.response.status === 401) {
				const errorData = error.response.data
				if (errorData?.code === 'MISSING_API_KEY' || errorData?.code === 'INVALID_API_KEY') {
					console.error('🔑 [AUTH] API Key authentication failed:', errorData.message)
					// Could redirect to login or show auth error
				}
			}
			console.error('Error data:', error.response.data)
		} else if (error.request) {
			console.error('❌ [HTTP] Network Error:', error.message)
		} else {
			console.error('❌ [HTTP] Request Setup Error:', error.message)
		}
		return Promise.reject(error)
	}
)

export default http
