import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages needs the base path to match the repository name if it's not a custom domain.
  // Assuming the repo might be named "Assignment-42All" or similar. 
  // Update this to your exact GitHub repo name, e.g. base: '/my-repo-name/'
  base: './', 
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
