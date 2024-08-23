<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import useToasts from '@/composables/useToasts'

const props = defineProps<{
  id?: number
}>()

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'update', id?: number): void
}>()

const { addToast } = useToasts()

const auth = useAuth()
const isSaving = ref(false)
const profileStore = useProfile()
const { t } = useI18n()
const theme = ref('')

const profile = computed(() => {
  return profileStore.profile
})

const cancelClicked = async () => {
  emit('cancel', props.id)
}

const saveClicked = async () => {
  try {
    isSaving.value = true

    if (profile.value) {
      const tempProfile = { ...profile.value }
      tempProfile.attributes.theme = theme.value

      await profileStore.upsert(tempProfile)
    }

    addToast({ text: t('Theme updated successfully'), variant: 'success' })

    if (profile.value?.userId) {
      await profileStore.fetchProfile(profile.value.userId, false)
    }

    await cancelClicked()
  } catch (error: any) {
    console.error('Error saving theme:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

const themeChanged = async (newTheme?: string) => {
  theme.value = newTheme || 'darkTheme'
}

watch(profile, (newProfile) => {
  if (newProfile) {
    theme.value = newProfile.attributes.theme || 'darkTheme'
  }
})

onMounted(async () => {})
</script>

<template>
  <v-card>
    <v-card-title>
      <v-icon icon="mdi-theme-light-dark" />
      {{ $t('Change Theme') }}
    </v-card-title>
    <v-divider />

    <v-card-text>
      <v-form>
        <ChooseTheme @theme-changed="themeChanged" />
      </v-form>
    </v-card-text>

    <v-divider />
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text :disabled="isSaving" @click="cancelClicked">Cancel</v-btn>
      <v-btn color="primary" :disabled="isSaving" :loading="isSaving" variant="elevated" @click="saveClicked"
        ><i-mdi-content-save />{{ $t('Save') }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
