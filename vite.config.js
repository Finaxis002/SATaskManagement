// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: process.env.PORT || 5173,  // Render will assign this port
    host: '0.0.0.0',  // Expose the server on all network interfaces
  },
});
