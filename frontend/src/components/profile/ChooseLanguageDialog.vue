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
const language = ref('')

const profile = computed(() => {
  return profileStore.profile
})

const languageChanged = async (newLanguage?: string) => {
  language.value = newLanguage || 'en'
}

const cancelClicked = async () => {
  emit('cancel', props.id)
}

const saveClicked = async () => {
  try {
    isSaving.value = true

    if (profile.value) {
      const tempProfile = { ...profile.value }
      tempProfile.attributes.language = language.value

      await profileStore.upsert(tempProfile)
    }

    addToast({ text: t('Language updated successfully'), variant: 'success' })

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

watch(profile, (newProfile) => {
  if (newProfile) {
    language.value = newProfile.attributes.language || 'en'
  }
})

onMounted(async () => {})
</script>

<template>
  <v-card>
    <v-card-title>
      <v-icon icon="mdi-flag" />
      {{ $t('Change Language') }}
    </v-card-title>
    <v-divider />

    <v-card-text>
      <v-form>
        <ChooseLanguage @language-changed="languageChanged" />
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
