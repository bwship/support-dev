<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import useToasts from '@/composables/useToasts'

const { addToast } = useToasts()

const auth = useAuth()
const { t } = useI18n()

const isLoggingOut = ref(false)
const showDialog = ref(false)

const logoutClicked = async () => {
  try {
    isLoggingOut.value = true

    await auth.logout()

    showDialog.value = false
  } catch (error: any) {
    // Handle the error, if needed
    console.error('Logging out failed:', error.message)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <v-dialog v-model="showDialog" width="500" persistent>
    <template #activator="{ props }">
      <v-list-item v-bind="props" class="profile-list-item" @click="showDialog = true">
        <template #prepend>
          <i-mdi-logout />
        </template>

        <v-list-item-title class="pl-2">{{ $t('Log Out') }}</v-list-item-title>
      </v-list-item>
    </template>

    <v-card prepend-icon="mdi-logout">
      <template #title>
        {{ $t('Log out') }}
      </template>
      <v-divider />

      <v-card-text class="pa-8">{{ $t('Are you sure want to log out?') }} </v-card-text>

      <v-divider />
      <v-card-actions class="pr-4 pb-4">
        <v-spacer></v-spacer>

        <v-btn :text="$t('No')" :disabled="isLoggingOut" @click="showDialog = false"></v-btn>
        <v-btn
          :text="$t('Yes')"
          variant="elevated"
          color="error"
          :loading="isLoggingOut"
          @click="logoutClicked"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
