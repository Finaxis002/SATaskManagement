import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    rollupOptions: {
      // Avoid native rollup
      external: ['@rollup/rollup-linux-x64-gnu', '@rollup/rollup-linux-x64-musl']
    }
  }
})
