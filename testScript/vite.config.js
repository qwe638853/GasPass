import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env': {},
    process: {
      env: {}
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})


