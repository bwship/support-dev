import '@/assets/scss/app.scss'
import { createApp } from 'vue'
import { createAuth } from './auth'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axiosInstance from './api/axios'
import i18n from './plugins/i18n'
import vuetify from './plugins/vuetify'
import Map from './components/addresses/Map.vue'
import { useAddress } from './stores/address'
import { inject } from '@vercel/analytics'

const auth = createAuth({
  router,
  loginRedirectRoute: { name: 'events' },
  logoutRedirectRoute: { name: 'index' },
  autoConfigureNavigationGuards: true,
  axios: {
    instance: axiosInstance,
    autoAddAuthorizationHeader: true,
  },
})

const app = createApp(App)
const store = createPinia()

const addressStore = useAddress(store)
addressStore.initialize()

// inject vercel analytics
inject()

app.use(router)
app.use(store)
app.use(auth)
app.use(i18n)
app.use(vuetify)
app.provide('enable-route-transitions', true)
app.component('Map', Map)
app.mount('#app')
