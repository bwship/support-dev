<route lang="yaml">
meta:
  public: true
</route>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
const isMobile = ref(false)

const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed

const auth = useAuth()
const route = useRoute()
const { t } = useI18n()
const token = route.query.token

onMounted(async () => {
  await auth.loginWithToken(token as string)

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title>
      {{ $t('Support.dev') }}
    </v-card-title>

    <v-card-subtitle>
      {{ $tc('Registration Complete.') }}
    </v-card-subtitle>

    <v-card-actions class="ma-4">
      <v-spacer />
      {{ token }}
      <v-spacer />
    </v-card-actions>
  </v-card>
</template>
