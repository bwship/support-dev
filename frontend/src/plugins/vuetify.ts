/**
 * Vuetify3 Plugin
 */
import { createVuetify, VuetifyOptions } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as labsComponents from 'vuetify/labs/components'
import { en } from 'vuetify/locale'

// Misc
import { loadFonts } from '@/plugins/webfontloader'

// Styles
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

await loadFonts()

const lightTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#1FADB5',
    'primary-darken-1': '#967a69',
    secondary: '#eac74b',
    'secondary-darken-1': '#374850',
    error: '#d9534f',
    info: '#113267',
    success: '#5cb85c',
    warning: '#FFD608',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1c1c1c',
    primary: '#1FADB5',
    secondary: '#eac74b',
    error: '#d9534f',
    info: '#83b9ff',
    success: '#5cb85c',
    warning: '#FFD608',
  },
}

/**
 * Vuetify Components
 *
 * @see {@link https://vuetifyjs.com/en/features/treeshaking/}
 */
let vuetifyConfig: VuetifyOptions = {
  // Global configuration
  // https://vuetifyjs.com/en/features/global-configuration/
  /*
  defaults: {
    global: {
      ripple: false,
    },
    VSheet: {
      elevation: 4,
    },
  },
  */
  // Icon Fonts
  // https://vuetifyjs.com/en/features/icon-fonts/
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  // Internationalization (i18n)
  // https://vuetifyjs.com/en/features/internationalization/#internationalization-i18n
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { en },
  },
  // Theme
  // https://vuetifyjs.com/en/features/theme/
  theme: {
    defaultTheme: 'darkTheme',
    themes: {
      darkTheme,
      lightTheme,
    },
  },
}

if (import.meta.env.DEV) {
  // Disable treeshaking for DEV mode.
  vuetifyConfig = {
    components: { components, labsComponents },
    directives,
    ...vuetifyConfig,
  }
}
export default createVuetify(vuetifyConfig)

// Export for test.
export { components, directives }
