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
const acceptDialog = ref(false)

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

const isAccepted = computed(() => {
  if (helperRequest.value?.status == 'ACCEPTED' && (helperRequest.value?.ranking || -1) == 1) return true
  return false
})

const isBackup = computed(() => {
  return helperRequest.value?.status == 'ACCEPTED' && (helperRequest.value?.ranking || -1) != 1
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
    status: 'ACCEPTED',
  }

  const res = await requestStore.upsertRequest(updatedRequest)
  if (res) {
    addToast({ text: t('Your response has been saved.'), variant: 'success' })
  } else {
    addToast({ text: t('Failed to update your response.'), variant: 'error' })
  }

  acceptDialog.value = false
}
</script>

<template>
  <v-btn v-if="!isAccepted && !isBackup && !isPast" color="primary" @click="acceptDialog = true"
    ><v-icon>mdi-hand-wave</v-icon> {{ $t('Pledge') }}
  </v-btn>

  <v-dialog v-model="acceptDialog" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon>mdi-hand-wave</v-icon>
        {{ $t('Pledge') }}
      </v-card-title>
      <v-divider />

      <v-card-text>{{ $t('Are you sure you want to pledge to help?') }}</v-card-text>

      <v-divider />
      <v-card-actions class="pr-4 pb-4">
        <v-spacer></v-spacer>

        <v-btn text @click="acceptDialog = false"> {{ $t('Cancel') }} </v-btn>
        <v-btn color="primary" variant="elevated" text @click="saveClicked"> {{ $t('Yes, Pledge') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
