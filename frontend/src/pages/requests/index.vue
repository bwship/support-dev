<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import useToasts from '@/composables/useToasts'
import { useAddress } from '@/stores/address'
import { useStep } from '@/stores/step'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'

const { addToast } = useToasts()
const { t } = useI18n()
const addressStore = useAddress()
const isLoading = ref(false)
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const stepStore = useStep()
const toggleView = ref(0)

const profile = computed(() => {
  return profileStore.profile
})

const teamId = computed(() => {
  return profile.value?.teamId
})

const refreshRequests = async (useCache: boolean) => {
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
  localStorage.setItem('requests-view', String(newValue))
})

onMounted(async () => {
  refreshRequests(true)

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
  <v-card elevation="0" prepend-icon="mdi-hand-wave">
    <template #title>
      <v-row>
        <v-col cols="8" class="pt-5">
          {{ t('Requests') }}
        </v-col>

        <v-col cols="4" class="text-right">
          <v-btn color="primary" variant="text" icon :disabled="isLoading" @click="refreshRequests(false, true)"
            ><i-mdi-refresh />
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <v-divider />

    <v-row class="pb-1">
      <v-col cols="auto">
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
    </v-row>
    <v-divider />

    <v-card-text class="pb-8 pt-0">
      <v-list v-if="isLoading">
        <v-list-subheader>{{ $t('Retrieving Requests') }}...</v-list-subheader>

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
      </v-list>

      <span v-else>
        <template v-if="toggleView === 0">
          <RequestCards />
        </template>
        <span v-else>
          <RequestList />
        </span>
      </span>
    </v-card-text>
  </v-card>
</template>
