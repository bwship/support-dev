<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProfile } from '@/stores/profile'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import useToasts from '@/composables/useToasts'

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'remove', id?: number): void
}>()

const { addToast } = useToasts()

const auth = useAuth()
const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const profileStore = useProfile()
const { t } = useI18n()

const isRemoving = ref(false)
const showDialog = ref(false)

const profile = computed(() => {
  return profileStore.profile
})

const removeClicked = async () => {
  isRemoving.value = true

  try {
    await profileStore.deactivate(id)
    addToast({ text: t('Dependent removed successfully'), variant: 'success' })

    emit('cancel', id)
    showDialog.value = false

    router.push({ name: 'dependents' })
  } catch (error: any) {
    // Handle the error, if needed
    console.error('Deleting dependent failed:', error.message)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isRemoving.value = false
  }
}

onMounted(async () => {
  profileStore.fetchTeammates(profile.value?.teamId as number)
})
</script>

<template>
  <v-dialog v-model="showDialog" width="500" persistent>
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="text" color="error" @click="showDialog = true">
        <i-mdi-trash-can />
        {{ $t('Remove') }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <i-mdi-trash-can />
        {{ $t('Remove Dependent') }}
      </v-card-title>
      <v-divider />
      <v-card-text>{{ $t('Are you sure want to remove this dependent?') }} </v-card-text>

      <v-divider />
      <v-card-actions class="pr-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn :text="$t('No')" :disabled="isRemoving" @click="showDialog = false"></v-btn>
        <v-btn
          :text="$t('Yes, remove')"
          variant="elevated"
          color="error"
          :loading="isRemoving"
          @click="removeClicked"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
