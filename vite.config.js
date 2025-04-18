// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: process.env.PORT || 5173,  // Ensure we bind to the port from Render
    allowedHosts: ['sataskmanagement.onrender.com', 'localhost'], // Add allowed hosts here
  },
});
