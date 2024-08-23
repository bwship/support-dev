<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import useToasts from '@/composables/useToasts'

const { addToast } = useToasts()

const auth = useAuth()
const { t } = useI18n()

const showDialog = ref(false)

const clearCacheClicked = async () => {
  try {
    localStorage.clear()

    showDialog.value = false
  } catch (error: any) {
    console.error('Failed to clear cache:', error.message)
    addToast({ text: error.message || error, variant: 'error' })
  }
}
</script>

<template>
  <v-dialog v-model="showDialog" width="500" persistent>
    <template #activator="{ props }">
      <v-btn v-bind="props" class="ml-2" variant="outlined" color="error" @click="showDialog = true">
        <i-mdi-cached />
        {{ $t('Clear Cache') }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <i-mdi-logout />
        {{ $t('Clear Cache') }}
      </v-card-title>
      <v-divider />
      <v-card-text>{{ $t('Are you sure want to clear cache?') }} </v-card-text>

      <v-divider />
      <v-card-actions class="pr-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn :text="$t('No')" @click="showDialog = false"></v-btn>
        <v-btn :text="$t('Yes')" variant="elevated" color="primary" @click="clearCacheClicked"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
