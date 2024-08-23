<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { useStep } from '@/stores/step'
import useToasts from '@/composables/useToasts'
import { useEvent } from '@/stores/event'
import { dateRulesFuture } from '@/utils/dateUtils'

const emit = defineEmits<{
  (e: 'insert', id?: number): void
}>()

const { addToast } = useToasts()

const eventStore = useEvent()
const isSaving = ref(false)
const profileStore = useProfile()
const stepStore = useStep()
const selectedEventId = ref()
const { t } = useI18n()
const showDuplicateDialog = ref(false)
const newStartDate = ref('')

const profile = computed(() => {
  return profileStore.profile
})

const events = computed(() => {
  return stepStore.events
})

const formattedEvents = computed(() => {
  return events.value.map((e) => ({ ...e, title: getTitle(e.startDate) }))
})

const teamId = computed(() => {
  return profile.value?.teamId
})

const minDate = ref(new Date().toISOString().substr(0, 10))

const cancelClicked = async () => {
  showDuplicateDialog.value = false
}

const saveClicked = async () => {
  if (!selectedEventId.value) return
  try {
    isSaving.value = true

    const profileId = profile.value?.id
    const teamId = profile.value?.teamId

    if (!profileId || !teamId) {
      throw 'no profile or team found'
    }

    try {
      const newDate = new Date(`${newStartDate.value}T00:00:00`)
      await eventStore.clone(selectedEventId.value, newDate)

      cancelClicked()

      addToast({ text: t('Event added successfully'), variant: 'success' })
    } catch (e) {
      addToast({ text: t('Failed to create a new event'), variant: 'warning' })
    }

    cancelClicked()
  } catch (error: any) {
    console.error('Error inserting event:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

const getTitle = (inputDate: string) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Split the input date string into year, month, and day
  const [year, monthIndex, day] = inputDate.split('-')

  // Get the month name based on the month index
  const monthName = months[parseInt(monthIndex, 10) - 1]

  // Format the output date string as 'Month DD, YYYY'
  const formattedDate = `${monthName} ${parseInt(day, 10)}, ${year}`

  return formattedDate
}

onMounted(async () => {
  newStartDate.value = new Date().toISOString().split('T')[0]
  minDate.value = new Date().toISOString().substr(0, 10)
  await stepStore.fetchSteps(teamId.value as number)

  selectedEventId.value = events.value[0].id || -1
})
</script>

<template>
  <!-- Clone Button -->
  <v-tooltip bottom>
    <template #activator="{ on }">
      <v-btn variant="text" icon color="primary" class="ml-2" v-bind="on" @click="showDuplicateDialog = true">
        <i-mdi-content-copy />
      </v-btn>
    </template>
    <span>{{ $t('Duplicate') }}</span>
  </v-tooltip>

  <!-- Event Duplicate Dialog -->
  <v-dialog v-model="showDuplicateDialog" width="500" persistent>
    <v-card>
      <v-card-title>
        <i-mdi-content-duplicate />
        {{ $t('Duplicate Event') }}
      </v-card-title>
      <v-divider />

      <v-card-text>
        <v-form>
          <v-select
            v-model="selectedEventId"
            :items="formattedEvents"
            item-title="title"
            item-text="title"
            item-value="id"
            :label="$t('Select Event to Copy')"
            prepend-inner-icon="mdi-calendar"
          ></v-select>

          <v-text-field
            v-model="newStartDate"
            type="date"
            :label="$t('New Event Date')"
            :rules="dateRulesFuture"
            :min="minDate"
            prepend-inner-icon="mdi-calendar"
          ></v-text-field>

          <v-divider />
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text :disabled="isSaving" @click="showDuplicateDialog = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              :disabled="isSaving || !selectedEventId"
              :loading="isSaving"
              @click="saveClicked"
              ><i-mdi-content-save />Save</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
