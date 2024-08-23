<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatDate } from '@/utils/dateUtils'
import { useProfile } from '@/stores/profile'
import { useStep } from '@/stores/step'
import { isStepAccepted, isStepMine, isStepPending } from '@/models/Step'

const props = defineProps<{
  pendingOnly?: boolean
}>()

const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
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
      const isPending = isStepPending(step)
      const isMine = isStepMine(step, profile.value?.id as number)

      if (!isMine) {
        return false
      }

      if (props.pendingOnly && isAccepted) {
        return false
      }

      if (!isAccepted && !isPending) {
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

onMounted(() => {
  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-list class="mx-auto full-height">
    <template v-for="event in filteredEvents" :key="event.id">
      <v-col cols="12">
        <v-list-subheader> {{ formatDate(event.startDate) }} </v-list-subheader>

        <div>
          <v-row>
            <template v-for="step in filteredSteps(event.id)" :key="step.id">
              <v-col :cols="isMobile ? '12' : '4'">
                <ChildCareRequestCard v-if="step.type == 'CHILD_CARE'" :step="step" />
                <MealRequestCard v-else-if="step.type == 'MEAL'" :step="step" />
                <TransportationRequestCard v-if="step.type == 'TRANSPORTATION'" :step="step" />
              </v-col>
            </template>
          </v-row>
        </div>
      </v-col>
    </template>

    <v-list v-if="!filteredEvents.length" class="mx-auto full-height">
      <v-list-item class="text-grey text-center">
        {{ $t('(None)') }}
      </v-list-item>
    </v-list>
  </v-list>
</template>
