<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useStep } from '@/stores/step'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { useRoute, useRouter } from 'vue-router'
import useToasts from '@/composables/useToasts'

const { addToast } = useToasts()
const auth = useAuth()
const route = useRoute()
const router = useRouter()
const stepStore = useStep()
const profileStore = useProfile()
const { t } = useI18n()
const isRemoving = ref(false)
const showDialog = ref(false)

const props = defineProps({
  id: {
    // event step
    type: Number,
    default: undefined,
  },
  textVersion: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'remove', id?: number): void
}>()

const isText = computed(() => {
  return props.textVersion || false
})

const id = computed(() => {
  return props.id || Number(route.params.id)
})

const profile = computed(() => {
  return profileStore.profile
})

const teamId = computed(() => {
  return profile.value?.teamId
})

const removeClicked = async () => {
  isRemoving.value = true

  try {
    const response = await stepStore.deactivateStep(id.value, teamId.value)

    if (response) {
      addToast({ text: t('Event step removed successfully'), variant: 'success' })
    } else {
      addToast({ text: t('Failed to remove event step'), variant: 'warning' })
    }

    emit('cancel', id.value)
    showDialog.value = false
    router.push({ name: 'events' })
  } catch (error: any) {
    console.error('Deleting events failed:', error.message)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isRemoving.value = false
  }
}

onMounted(async () => {})
</script>

<template>
  <v-dialog v-model="showDialog" width="500" persistent>
    <template #activator="{ props }">
      <v-btn v-if="isText" v-bind="props" variant="outlined" color="error" @click="showDialog = true">
        <div class="remove-text-icon"><i-mdi-trash-can /> {{ $t('Remove') }}</div>
      </v-btn>

      <v-btn v-else v-bind="props" icon color="error" @click="showDialog = true">
        <i-mdi-trash-can />
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <i-mdi-trash-can />
        {{ $t('Remove Event') }}
      </v-card-title>
      <v-divider />
      <v-card-text>{{ $t('Are you sure want to remove this event step?') }} </v-card-text>

      <v-divider />
      <v-card-actions class="pr-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn :text="$t('No')" :disabled="isRemoving" @click="showDialog = false"></v-btn>
        <v-btn :text="$t('Yes')" variant="elevated" color="error" :loading="isRemoving" @click="removeClicked"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.remove-text-icon {
  text-transform: capitalize;
  display: flex;
  align-items: center;
}
</style>
