import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: process.env.GITHUB_PAGES === 'true' ? '/instagram-clone/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
}))
