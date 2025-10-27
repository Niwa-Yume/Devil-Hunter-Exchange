import { fileURLToPath } from 'node:url'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/icon'
  ],
  css: [
    fileURLToPath(new URL('./assets/main.css', import.meta.url))
  ],
  fonts: {
    // Charge les polices via @nuxt/fonts (Google Fonts)
    families: [
      { name: 'Special Elite', provider: 'google' },
      { name: 'Roboto Mono', provider: 'google' },
      { name: 'Oswald', provider: 'google' }
    ]
  },
  vite: {
    plugins: [tsconfigPaths()],
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    },
    esbuild: {
      target: 'esnext'
    }
  },
  nitro: {
    routeRules: process.env.NODE_ENV === 'production'
      ? {
          '/_nuxt/**': {
            headers: {
              'cache-control': 'public, max-age=31536000, immutable'
            }
          },
          '/images/**': {
            headers: {
              'cache-control': 'public, max-age=604800'
            }
          }
        }
      : {}
  }
})