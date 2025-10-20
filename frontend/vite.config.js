import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills(),
  ],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: []
  },
  resolve: {
    alias: {
      'bn.js': 'bn.js/lib/bn.js',
      'cross-fetch': 'cross-fetch/dist/browser-ponyfill.js',
      'browser-headers': 'browser-headers/dist/browser-headers.umd.js',
      '@improbable-eng/grpc-web': '@improbable-eng/grpc-web/dist/grpc-web-client.umd.js',
      '@cosmjs/proto-signing': '@cosmjs/proto-signing/build/index.js',
      '@cosmjs/stargate': '@cosmjs/stargate/build/index.js',
      'event-iterator': 'event-iterator/lib/event-iterator.js',
      '@avail-project/nexus-core/dist/commons': '@avail-project/nexus-core/dist/commons/index.js'
    }
  }
})
