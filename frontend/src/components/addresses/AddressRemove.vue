<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAddress } from '@/stores/address'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { useRoute } from 'vue-router'
import useToasts from '@/composables/useToasts'

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'remove', id?: number): void
}>()

const { addToast } = useToasts()

const auth = useAuth()
const route = useRoute()
const id = Number(route.params.id)
const addressStore = useAddress()
const profileStore = useProfile()
const { t } = useI18n()

const isRemoving = ref(false)
const showDialog = ref(false)

const addresses = computed(() => {
  return addressStore.addresses
})

const profile = computed(() => {
  return profileStore.profile
})

const removeClicked = async () => {
  isRemoving.value = true

  try {
    await addressStore.deactivate(id)
    addToast({ text: t('Address removed successfully'), variant: 'success' })

    emit('remove', id)
    showDialog.value = false
  } catch (error: any) {
    // Handle the error, if needed
    console.error('Deleting address failed:', error.message)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isRemoving.value = false
  }
}

onMounted(async () => {
  addressStore.fetchAddresses(profile.value?.teamId as number)
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
        {{ $t('Remove Address') }}
      </v-card-title>
      <v-divider />
      <v-card-text>{{ $t('Are you sure want to remove this address?') }} </v-card-text>

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
