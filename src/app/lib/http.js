import axios from 'axios'

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance with default configuration
const http = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000, // 30 seconds timeout
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	},
})

// Request interceptor for logging and auth (if needed in future)
http.interceptors.request.use(
	(config) => {
		// Log request in development
		if (import.meta.env.DEV) {
			console.log(`🚀 [HTTP] ${config.method?.toUpperCase()} ${config.url}`)
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
