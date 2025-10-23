export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/icon'
  ],
  css: [
    '~/assets/tailwind.css',
    '~/assets/main.css'
  ],
  fonts: {
    // Charge les polices via @nuxt/fonts (Google Fonts)
    families: [
      { name: 'Special Elite', provider: 'google' },
      { name: 'Roboto Mono', provider: 'google' },
      { name: 'Oswald', provider: 'google' }
    ]
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