<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import useToasts from '@/composables/useToasts'
import { computed, onMounted, ref, watch } from 'vue'
import { formatDate } from '@/utils/dateUtils'
import { useAddress } from '@/stores/address'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { useStep } from '@/stores/step'
import { isStepAccepted } from '@/models/Step'

const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 640 // Adjust the breakpoint as needed
const stepStore = useStep()
const { addToast } = useToasts()
const addressStore = useAddress()
const toggleView = ref(0)
const isLoading = ref(false)
const profileStore = useProfile()
const { t } = useI18n()

const selectedStatusOption = ref(['accepted', 'pending'])
const selectedTypeOption = ref(['CHILD_CARE', 'MEAL', 'TRANSPORTATION'])

const statusOptions = [
  { title: '✅ Accepted', value: 'accepted' },
  { title: '⚠️ Pending', value: 'pending' },
]

const typeOptions = [
  { title: '🧒🏽 Child Care', value: 'CHILD_CARE' },
  { title: '🍴 Meal', value: 'MEAL' },
  { title: '🚗 Transportation', value: 'TRANSPORTATION' },
]

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

const steps = computed(() => {
  return stepStore.steps
})

const profile = computed(() => {
  return profileStore.profile
})

const teamId = computed(() => {
  return profile.value?.teamId
})

const filteredSteps = (eventId: number) => {
  return steps.value
    .filter((step) => {
      // Check if the step belongs to the specified eventId
      if (step.eventId !== eventId) {
        return false
      }

      const selectedTypes = selectedTypeOption.value
      if (!selectedTypes.includes(step.type)) {
        return false
      }

      // Calculate the isAccepted flag based on the requests' statuses
      const isAccepted = isStepAccepted(step)

      // Check the selected status options
      const selectedStatus = selectedStatusOption.value
      if (selectedStatus.includes('pending') && !isAccepted) {
        return true
      }

      if (selectedStatus.includes('accepted') && isAccepted) {
        return true
      }

      return false
    })
    .sort((a, b) => {
      // Sort the steps by their type
      return a.type.localeCompare(b.type)
    })
}

const refreshEvents = async (useCache: boolean) => {
  isLoading.value = true

  try {
    await Promise.all([
      profileStore.fetchTeammates(teamId.value as number, useCache),
      addressStore.fetchAddresses(teamId.value as number, useCache),
      stepStore.fetchSteps(teamId.value as number, useCache),
    ])
  } catch (error: any) {
    console.error('Error refreshing events:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isLoading.value = false
  }
}

watch(toggleView, (newValue) => {
  localStorage.setItem('events-view', String(newValue))
})

onMounted(() => {
  refreshEvents(true)

  toggleView.value = Number(localStorage.getItem('events-view') || 0)

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0" prepend-icon="mdi-calendar-clock">
    <template #title>
      <v-row>
        <v-col cols="8" class="pt-6">
          {{ $t('Events') }}
        </v-col>

        <v-col :cols="isMobile ? 'auto' : 4" class="text-right">
          <!-- Add Button -->
          <EventAddMenu />

          <!-- Clone Button -->
          <EventDuplicate />

          <!-- Refresh Button -->
          <v-btn color="primary" variant="text" icon :disabled="isLoading" @click="refreshEvents(false, true)"
            ><i-mdi-refresh />
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <v-divider />

    <v-row class="pt-3">
      <v-col :cols="isMobile ? '12' : '2'">
        <v-btn-toggle v-model="toggleView">
          <v-btn class="ml-4">
            <v-icon>mdi-view-module</v-icon>
            <!-- Icon for card view -->
          </v-btn>
          <v-btn>
            <v-icon>mdi-view-list</v-icon>
            <!-- Icon for list view -->
          </v-btn>
        </v-btn-toggle>
      </v-col>

      <v-col :cols="isMobile ? '12' : '4'">
        <v-select
          v-model="selectedTypeOption"
          density="compact"
          variant="outlined"
          chips
          multiple
          :items="typeOptions"
          :label="t('Service')"
        >
        </v-select>
      </v-col>

      <v-col :cols="isMobile ? '12' : '4'">
        <v-select
          v-model="selectedStatusOption"
          density="compact"
          variant="outlined"
          chips
          multiple
          :items="statusOptions"
          :label="t('Status')"
        ></v-select>
      </v-col>
    </v-row>
    <v-divider />

    <v-card-text class="pb-8 pt-0">
      <v-list>
        <span v-if="isLoading">
          <v-list-subheader>{{ $t('Retrieving Events') }}...</v-list-subheader>

          <template v-if="toggleView === 0">
            <v-list-item>
              <v-row>
                <v-col v-for="index in 3" :key="index" :cols="isMobile ? '12' : '4'">
                  <v-skeleton-loader type="card"></v-skeleton-loader>
                </v-col>
              </v-row>
            </v-list-item>
          </template>
          <template v-else>
            <v-list-item v-for="index in 3" :key="index">
              <v-skeleton-loader type="list-item-avatar"></v-skeleton-loader>
            </v-list-item>
          </template>
        </span>

        <span v-else>
          <!-- When toggleView is 0, display ChildCareCard components in a two-column layout -->
          <template v-if="toggleView === 0">
            <template v-for="event in events" :key="event.id">
              <v-col cols="12">
                <v-list-subheader>{{ formatDate(event.startDate) }}</v-list-subheader>

                <div>
                  <v-row>
                    <template v-for="step in filteredSteps(event.id)" :key="step.id">
                      <v-col :cols="isMobile ? '12' : '4'">
                        <ChildCareCard v-if="step.type === 'CHILD_CARE'" :step="step" />
                        <MealCard v-if="step.type === 'MEAL'" :step="step" />
                        <TransportationCard v-if="step.type === 'TRANSPORTATION'" :step="step" />
                      </v-col>
                    </template>
                  </v-row>
                </div>
              </v-col>
            </template>
          </template>

          <!-- When toggleView is 1, display list items -->
          <template v-else>
            <template v-for="event in events" :key="event.id">
              <v-col cols="12">
                <v-list-subheader>{{ formatDate(event.startDate) }}</v-list-subheader>

                <template v-for="step in filteredSteps(event.id)" :key="step.id">
                  <span v-if="toggleView === 1">
                    <ChildCareListItem v-if="step.type === 'CHILD_CARE'" class="pl-8" :step="step" />
                    <MealListItem v-else-if="step.type === 'MEAL'" class="pl-8" :step="step" />
                    <TransportationListItem v-if="step.type === 'TRANSPORTATION'" class="pl-8" :step="step" />
                  </span>
                </template>
              </v-col>
            </template>
          </template>

          <v-list-item v-if="!events.length" class="text-grey text-center">
            {{ $t('(None)') }}
          </v-list-item>
        </span>
      </v-list>
    </v-card-text>
  </v-card>
</template>
