import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "./src/styles/variables.scss" as *;`,
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  server: {
    port: 3000,
    host: true, // Listen on all addresses (needed for Docker)
    watch: {
      usePolling: true // Enable polling for Docker volume sync
    }
  }
})
