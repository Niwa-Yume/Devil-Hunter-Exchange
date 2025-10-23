import { defineAppConfig } from 'nuxt/app'

export default defineAppConfig({
  ui: {
    primary: 'orange',
    gray: 'neutral',
    strategy: 'merge',
    button: {
      rounded: 'rounded-none',
      shadow: 'shadow-none'
    },
    card: {
      rounded: 'rounded-none',
      shadow: 'shadow-none'
    }
  }
})
