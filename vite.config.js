import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
	plugins: [vue()],
	server: {
		port: Number(process.env.VITE_PORT) || 1100,
		host: true,
		cors: true
	},
	build: {
		outDir: path.resolve(__dirname, 'dist'),
		emptyOutDir: true,
	},
})
