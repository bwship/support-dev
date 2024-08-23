<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/dateUtils'
import { useProfile } from '@/stores/profile'
import { useStep } from '@/stores/step'
import { isStepAccepted, isStepMine } from '@/models/Step'

const props = defineProps<{
  pendingOnly?: boolean
}>()

const profileStore = useProfile()
const stepStore = useStep()

const events = computed(() => {
  return stepStore.events.slice().sort((a, b) => {
    // Parse the startDate strings into Date objects
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)

    // Compare the dates
    if (dateA < dateB) {
      return -1
    }
    if (dateA > dateB) {
      return 1
    }
    // If the dates are equal, no need to sort further
    return 0
  })
})

const filteredEvents = computed(() => {
  return events.value.filter((event) => {
    // Check if there are any steps for this event in filteredSteps
    return filteredSteps(event.id).length > 0
  })
})

const profile = computed(() => {
  return profileStore.profile
})

const filteredSteps = (eventId: number) => {
  return steps.value
    .filter((step) => {
      // only return current event's steps
      if (step.eventId !== eventId) {
        return false
      }

      // if pendingOnly is true, only return pending steps
      const isAccepted = isStepAccepted(step)
      const isMine = isStepMine(step, profile.value?.id as number)

      if (props.pendingOnly && isAccepted && isMine) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort the steps by their type
      return a.type.localeCompare(b.type)
    })
}

const steps = computed(() => {
  return stepStore.steps
})
</script>

<template>
  <v-list class="mx-auto full-height">
    <template v-for="event in filteredEvents" :key="event.id">
      <v-list-subheader> {{ formatDate(event.startDate) }} </v-list-subheader>

      <template v-for="step in filteredSteps(event.id)" :key="step.id">
        <ChildCareRequestListItems v-if="step.type == 'CHILD_CARE'" class="pl-8" :step="step" />
        <MealRequestListItem v-else-if="step.type == 'MEAL'" class="pl-8" :step="step" />
        <TransportationRequestListItem v-if="step.type == 'TRANSPORTATION'" class="pl-8" :step="step" />
      </template>
    </template>

    <v-listc v-if="!filteredEvents.length" class="mx-auto full-height">
      <v-list-item class="text-grey text-center">
        {{ $t('(None)') }}
      </v-list-item>
    </v-listc>
  </v-list>
</template>
