<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useAuth } from '@/auth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { useTheme } from 'vuetify'

const auth = useAuth()
const profileStore = useProfile()
const theme = useTheme()
const { locale } = useI18n()

const profile = computed(() => {
  return profileStore.profile
})

watch(profile, (newProfile) => {
  if (newProfile) {
    locale.value = newProfile.attributes.language || 'en'
    theme.global.name.value = newProfile.attributes.theme || 'darkTheme'
  }
})

// Use the onMounted hook to call retrieveSession when the component is mounted
onMounted(async () => {
  await auth.retrieveSession()

  if (auth.isAuthenticated) {
    const userId = auth.user.id
    await profileStore.fetchProfile(userId as string, false)
  }
})
</script>

<template>
  <RouterViewTransition is-root></RouterViewTransition>
  <Toasts />
</template>
