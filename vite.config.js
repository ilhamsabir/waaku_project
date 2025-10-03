import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
	plugins: [vue()],
	server: {
		port: Number(process.env.VITE_PORT) || 1100,
		host: true,
		cors: true,
		proxy: {
			// Use configurable API port for dev to avoid port conflicts
			// Set VITE_API_DEV_PORT in .env (defaults to 4300)
			...( (() => {
				const apiPort = Number(process.env.VITE_API_DEV_PORT) || 4300
				const socketPort = Number(process.env.VITE_SOCKET_PORT) || apiPort
				return {
					'/api': {
						target: `http://localhost:${apiPort}`,
						changeOrigin: true,
						ws: true,
					},
					'/auth': {
						target: `http://localhost:${apiPort}`,
						changeOrigin: true,
					},
					'/health': {
						target: `http://localhost:${apiPort}`,
						changeOrigin: true,
					},
					'/api-docs': {
						target: `http://localhost:${apiPort}`,
						changeOrigin: true,
					},
					'/socket.io': {
						target: `http://localhost:${socketPort}`,
						ws: true,
					},
				}
			})() )
		}
	},
	build: {
		outDir: path.resolve(__dirname, 'dist'),
		emptyOutDir: true,
	},
})
