import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        // Mantener Host/Origin del frontend y cookies sin Domain reescrito.
        changeOrigin: false,
      },
    },
  },
})
