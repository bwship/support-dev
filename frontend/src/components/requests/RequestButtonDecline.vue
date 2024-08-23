<script setup lang="ts">
import useToasts from '@/composables/useToasts'
import { RequestUpsert } from '@/models/Request'
import { Step } from '@/models/Step'
import { useProfile } from '@/stores/profile'
import { computed, ref } from 'vue'
import { useStep } from '@/stores/step'
import { useRequest } from '@/stores/request'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { addToast } = useToasts()
const stepStore = useStep()
const profileStore = useProfile()
const requestStore = useRequest()
const declineDialog = ref(false)

const props = defineProps<{
  step: Step
}>()

const isPast = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return event.value ? event.value.startDate < today : true
})

const step = computed(() => {
  return props.step
})

const event = computed(() => {
  return stepStore.events.find((a) => a.id == step.value?.eventId)
})

const profile = computed(() => {
  return profileStore.profile
})

const helperRequest = computed(() => {
  return profile.value ? step?.value?.requests?.find((r) => r.profileId == profile.value?.id) : undefined
})

async function saveClicked() {
  if (!helperRequest.value || isPast.value) return

  const updatedRequest: RequestUpsert = {
    id: helperRequest.value?.id,
    stepId: helperRequest.value.stepId,
    notes: helperRequest.value.notes as string,
    profileId: helperRequest.value.profileId,
    status: 'DECLINED',
  }

  const res = await requestStore.upsertRequest(updatedRequest)
  if (res) {
    addToast({ text: t('Your response has been saved.'), variant: 'success' })
  } else {
    addToast({ text: t('Failed to update your response.'), variant: 'error' })
  }

  declineDialog.value = false
}
</script>

<template>
  <v-btn v-if="!isPast" class="text-error ml-2" variant="text" @click="declineDialog = true"
    ><v-icon>mdi-close</v-icon> {{ $t('Decline') }}
  </v-btn>

  <v-dialog v-model="declineDialog" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon>mdi-close</v-icon>
        {{ $t('Decline') }}
      </v-card-title>
      <v-divider />

      <v-card-text>{{ $t('Are you sure you want to decline?') }}</v-card-text>

      <v-divider />
      <v-card-actions class="pr-4 pb-4">
        <v-spacer></v-spacer>

        <v-btn text @click="declineDialog = false"> {{ $t('Cancel') }} </v-btn>
        <v-btn color="error" variant="elevated" text @click="saveClicked"> {{ $t('Yes, Decline') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
