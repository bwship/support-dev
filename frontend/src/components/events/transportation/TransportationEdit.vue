<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import useToasts from '@/composables/useToasts'
import { Step } from '@/models/Step'
import { Event } from '@/models/Event'
import { computed, onMounted, ref } from 'vue'
import { convertAddressToText } from '@/utils/addressUtils'
import { toISOString, toLocalString } from '@/utils/dateUtils'
import { useAddress } from '@/stores/address'
import { useStep } from '@/stores/step'
import { useEvent } from '@/stores/event'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'insert', id?: number): void
  (e: 'update', id?: number): void
}>()

const addressStore = useAddress()
const description = ref('')
const endAddressId = ref<number | null>(null)
const stepStore = useStep()
const eventStore = useEvent()
const isSaving = ref(false)
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const pickupDateTime = ref('')
const profileStore = useProfile()
const showAddAddressDialog = ref(false)
const startAddressId = ref<number | null>(null)
const { addToast } = useToasts()
const { t } = useI18n()

const props = defineProps<{
  eventId?: number
  stepId?: number
}>()

const addresses = computed(() => {
  return addressStore.addresses.map((address) => {
    return {
      ...address,
      text: convertAddressToText(address, t(address.type) + ' - '),
    }
  })
})

const endAddress = computed(() => {
  return addresses.value.find((a) => a.id == endAddressId.value)
})

const events = computed(() => {
  return stepStore.events
})

const isAdd = computed(() => {
  return props.stepId == undefined || props.stepId == null
})

const startAddress = computed(() => {
  return addresses.value.find((a) => a.id == startAddressId.value)
})

const step = computed(() => {
  if (props.eventId && props.stepId) {
    return stepStore.steps.find((a) => a.id == props.stepId && a.type == 'TRANSPORTATION')
  }

  return null
})

const teamId = computed(() => {
  return profile.value?.teamId
})

const title = computed(() => {
  return isAdd.value ? t('Add Transportation') : t('Edit Transportation')
})

const profile = computed(() => {
  return profileStore.profile
})

function fillAddStep() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1) // Set to tomorrow

  // Set pickupDateTime to tomorrow at 8 AM
  const fromDateTimeValue = new Date(tomorrow)
  fromDateTimeValue.setHours(3, 0, 0, 0)
  pickupDateTime.value = fromDateTimeValue.toISOString().slice(0, 16)
}

function fillEditStep(step: Step) {
  if (step) {
    if (step.type == 'TRANSPORTATION' && step.transportationAttributes) {
      if (step.transportationAttributes.pickupAt) {
        pickupDateTime.value = new Date(step.transportationAttributes.pickupAt).toISOString().slice(0, 16)
      }
      if (step.transportationAttributes.startAddressId) {
        startAddressId.value = step.transportationAttributes.startAddressId
      }
      if (step.transportationAttributes.endAddressId) {
        endAddressId.value = step.transportationAttributes.endAddressId
      }
      description.value = step.notes
    } else {
      throw 'Event step must be a transportation event.'
    }
  }
}

const cancelClicked = async () => {
  emit('close')
}

const saveClicked = async () => {
  try {
    isSaving.value = true

    const profileId = profile.value?.id

    if (!profileId || !teamId.value) {
      throw 'no profile or team found'
    }

    const startDate = toLocalString(new Date(pickupDateTime.value))

    const attributes = {
      start_address_id: startAddressId.value,
      end_address_id: endAddressId.value,
      pickup_at: toISOString(new Date(pickupDateTime.value)),
    }

    const step = {
      ...(props.stepId && { id: props.stepId }),
      startDate,
      teamId: teamId.value,
      type: 'TRANSPORTATION',
      attributes: attributes,
      notes: description.value,
    }

    const res = await stepStore.upsertStep(step)

    const toastText = res
      ? props.stepId
        ? t('Event step updated successfully')
        : t('Event step added successfully')
      : props.stepId
      ? t('Failed to update event step')
      : t('Failed to create a new event')

    const toastVariant = res ? 'success' : 'warning'

    addToast({ text: toastText, variant: toastVariant })

    await stepStore.fetchSteps(teamId.value, false)

    cancelClicked()
  } catch (error: any) {
    console.error('Error inserting event step:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (teamId.value) {
    await Promise.all([profileStore.fetchTeammates(teamId.value), addressStore.fetchAddresses(teamId.value)])
  }

  if (isAdd.value) {
    fillAddStep()
  } else if (step.value) {
    fillEditStep(step.value)
  }

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <v-btn color="primary" variant="text" text :disabled="isSaving" @click="cancelClicked">Cancel</v-btn>

      <span class="text-center">{{ title }}</span>

      <v-btn color="primary" :disabled="isSaving" :loading="isSaving" @click="saveClicked">
        <i-mdi-content-save />{{ $t('Save') }}</v-btn
      >
    </v-card-title>
    <v-divider />

    <v-card-text>
      <v-form>
        <h5>{{ $t('Date & Time') }}</h5>
        <v-divider />

        <v-text-field
          v-model="pickupDateTime"
          type="datetime-local"
          :label="$t('Pickup Date')"
          prepend-inner-icon="mdi-calendar"
        ></v-text-field>

        <h5>
          <v-row>
            <v-col cols="8" class="text-left">
              {{ $t('Location') }}
            </v-col>
            <v-col cols="4" class="text-right">
              <v-btn variant="text" color="primary" @click="showAddAddressDialog = true">
                <i-mdi-plus class="mr-2" />
                {{ $t('Add New') }}
              </v-btn>
            </v-col>
          </v-row>
        </h5>
        <v-divider />

        <v-select
          v-model="startAddressId"
          :label="$t('From Address')"
          :items="addresses"
          item-title="text"
          item-value="id"
          variant="outlined"
        ></v-select>

        <v-select
          v-model="endAddressId"
          :label="$t('To Address')"
          :items="addresses"
          item-title="text"
          item-value="id"
          variant="outlined"
        ></v-select>

        <v-row v-if="startAddressId || endAddressId">
          <v-col cols="12">
            <MapMultiple class="map mb-5" :addresses="[startAddress, endAddress]"></MapMultiple>
          </v-col>
        </v-row>

        <h5>{{ $t('Notes') }}</h5>
        <v-divider />

        <v-textarea v-model="description"></v-textarea>

        <v-dialog v-model="showAddAddressDialog" :fullscreen="isMobile" width="800" persistent>
          <AddressEdit @cancel="showAddAddressDialog = false" />
        </v-dialog>
      </v-form>
    </v-card-text>
  </v-card>
</template>
