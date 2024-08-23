<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'

const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const showEditDialog = ref(false)
const { t } = useI18n()

const profile = computed(() => {
  return profileStore.profile
})

const hasResponseErrors = computed(() => {
  return isHelper.value && !responseTypes.value?.length
})

const id = computed(() => {
  return profile.value?.id
})

const isHelper = computed(() => {
  return roles?.value?.includes('HELPER')
})

const responseTypes = computed(() => {
  return profile.value?.relationshipAttributes?.responseTypes
})

const roles = computed(() => {
  return profile.value?.roles
})

onMounted(async () => {
  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-sheet v-if="hasResponseErrors" color="error">
    <v-banner
      color="error"
      icon="mdi-alert"
      lines="one"
      :text="t('Please select the services that you can help with.')"
      :stacked="false"
    >
      <v-btn variant="elevated" color="error" @click="showEditDialog = true">
        <i-mdi-pencil />
        {{ $t('Select Services') }}
      </v-btn>

      <v-dialog v-model="showEditDialog" :fullscreen="isMobile" width="800" persistent>
        <ProfileEdit :id="id" @cancel="showEditDialog = false" />
      </v-dialog>
    </v-banner>
  </v-sheet>
</template>
