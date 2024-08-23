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

const addressId = ref<number | null>(null)
const addressStore = useAddress()
const eventStore = useEvent()
const description = ref('')
const forDependants = ref<number[]>([])
const fromDateTime = ref('')
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const isSaving = ref(false)
const profileStore = useProfile()
const showAddAddressDialog = ref(false)
const showAddDependantDialog = ref(false)
const stepStore = useStep()
const toDateTime = ref('')
const { addToast } = useToasts()
const { t } = useI18n()

const props = defineProps<{
  eventId?: number
  stepId?: number
}>()

const address = computed(() => {
  return addresses.value.find((a) => a.id == addressId.value)
})

const addresses = computed(() => {
  return addressStore.addresses.map((address) => {
    return {
      ...address,
      text: convertAddressToText(address, t(address.type) + ' - '),
    }
  })
})

const dependents = computed(() => {
  return profileStore.dependents()?.map((profile) => {
    return {
      ...profile,
      text: profile.firstName + ' ' + profile.lastName,
    }
  })
})

const events = computed(() => {
  return stepStore.events
})

const isAdd = computed(() => {
  return !props.stepId
})

const profile = computed(() => {
  return profileStore.profile
})

const teamId = computed(() => {
  return profile.value?.teamId
})

const title = computed(() => {
  return isAdd.value ? t('Add Child Care') : t('Edit Child Care')
})

const step = computed(() => {
  return props.eventId && props.stepId
    ? stepStore.steps.find((a) => a.id == props.stepId && a.type == 'CHILD_CARE')
    : null
})

function fillAddStep() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1) // Set to tomorrow

  // Set fromDateTime to tomorrow at 8 AM
  const fromDateTimeValue = new Date(tomorrow)
  fromDateTimeValue.setHours(3, 0, 0, 0)
  fromDateTime.value = fromDateTimeValue.toISOString().slice(0, 16)

  // Set toDateTime to tomorrow at 12 PM
  const toDateTimeValue = new Date(tomorrow)
  toDateTimeValue.setHours(7, 0, 0, 0)
  toDateTime.value = toDateTimeValue.toISOString().slice(0, 16)
}

function fillEditStep(step: Step) {
  if (step.type == 'CHILD_CARE' && step.childCareAttributes) {
    const { startAt, endAt, addressId: attributeAddressId, familyMemberIds } = step.childCareAttributes

    if (startAt) {
      fromDateTime.value = new Date(startAt).toISOString().slice(0, 16)
    }

    if (endAt) {
      toDateTime.value = new Date(endAt).toISOString().slice(0, 16)
    }

    if (attributeAddressId) {
      addressId.value = attributeAddressId
    }

    if (familyMemberIds) {
      forDependants.value = familyMemberIds
    }

    description.value = step.notes
  } else {
    throw 'Event step must be a child care event.'
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

    const startDate = toLocalString(new Date(fromDateTime.value))

    const attributes = {
      address_id: addressId.value,
      start_at: toISOString(new Date(fromDateTime.value)),
      end_at: toISOString(new Date(toDateTime.value)),
      family_member_ids: forDependants.value,
    }

    const step = {
      ...(props.stepId && { id: props.stepId }),
      startDate,
      teamId: teamId.value,
      type: 'CHILD_CARE',
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
    profileStore.fetchTeammates(teamId.value)
    addressStore.fetchAddresses(teamId.value)
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

        <v-row>
          <v-col>
            <v-text-field
              v-model="fromDateTime"
              type="datetime-local"
              :label="$t('From')"
              prepend-inner-icon="mdi-calendar"
            ></v-text-field>
          </v-col>

          <v-col>
            <v-text-field
              v-model="toDateTime"
              type="datetime-local"
              :label="$t('To')"
              prepend-inner-icon="mdi-calendar"
            ></v-text-field>
          </v-col>
        </v-row>

        <h5>
          <v-row>
            <v-col cols="8" class="text-left">
              {{ $t('Watching') }}
            </v-col>
            <v-col cols="4" class="text-right">
              <v-btn variant="text" color="primary" @click="showAddDependantDialog = true">
                <i-mdi-plus class="mr-2" />
                {{ $t('Add New') }}
              </v-btn>
            </v-col>
          </v-row>
        </h5>
        <v-divider />

        <v-select
          v-model="forDependants"
          :label="$t('Dependents')"
          :items="dependents"
          item-title="text"
          item-value="id"
          chips
          multiple
          variant="outlined"
        ></v-select>

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
          v-model="addressId"
          :label="$t('Address')"
          :items="addresses"
          item-title="text"
          item-value="id"
          clearable
          variant="outlined"
        ></v-select>

        <v-row>
          <v-col cols="12">
            <Map v-if="address" :address="address"></Map>
          </v-col>
        </v-row>

        <h5>{{ $t('Notes') }}</h5>
        <v-divider />

        <v-textarea v-model="description"></v-textarea>

        <v-dialog v-model="showAddDependantDialog" :fullscreen="isMobile" width="800" persistent>
          <DependentEdit @cancel="showAddDependantDialog = false" />
        </v-dialog>

        <v-dialog v-model="showAddAddressDialog" :fullscreen="isMobile" width="800" persistent>
          <AddressEdit @cancel="showAddAddressDialog = false" />
        </v-dialog>
      </v-form>
    </v-card-text>
  </v-card>
</template>
