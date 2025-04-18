import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: process.env.PORT || 5173,  // Render will use process.env.PORT
    host: true,  // Ensure the app listens on 0.0.0.0, which is needed for cloud hosting
  },
})
