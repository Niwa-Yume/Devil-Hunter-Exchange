import { defineAppConfig } from 'nuxt/app'

export default defineAppConfig({
  ui: {
    // Palette primaire custom DHX (orange industriel #ff3d00)
    primary: 'dhx',
    colors: {
      dhx: {
        50:  '#fff3ee',
        100: '#ffe5db',
        200: '#ffcab8',
        300: '#ffab8e',
        400: '#ff7b4f',
        500: '#ff3d00', // ton principal
        600: '#e63700',
        700: '#c73000',
        800: '#a32800',
        900: '#7f2000',
        950: '#4a1300'
      }
    },
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
