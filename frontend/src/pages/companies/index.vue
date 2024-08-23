<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProfile } from '@/stores/profile'
import useToasts from '@/composables/useToasts'

const { addToast } = useToasts()
const isLoading = ref(false)
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const showAddDialog = ref(false)

const companies = computed(() => {
  return profileStore.companies
})

const refreshCompanies = async () => {
  isLoading.value = true

  try {
    await profileStore.fetchCompanies(false)
  } catch (error: any) {
    console.error('Error refreshing companies:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isLoading.value = false // Set isLoading back to false when done fetching
  }
}

onMounted(async () => {
  profileStore.fetchCompanies()

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0" prepend-icon="mdi-domain">
    <template #title>
      <v-row>
        <v-col cols="9" class="pt-6">
          {{ $t('Companies') }}
        </v-col>

        <v-col :cols="isMobile ? 'auto' : '3'" class="mt-2 text-right">
          <v-btn color="primary" :disabled="isLoading" icon variant="text" @click="refreshCompanies"
            ><i-mdi-refresh />
          </v-btn>

          <v-btn color="primary" @click="showAddDialog = true">
            <i-mdi-plus />
            {{ $t('Add Company') }}
          </v-btn>

          <v-dialog v-model="showAddDialog" :fullscreen="isMobile" width="800" persistent>
            <CompanyEdit @cancel="showAddDialog = false" />
          </v-dialog>
        </v-col>
      </v-row>
    </template>
    <v-divider />

    <v-card-text>
      <span v-if="isLoading">
        <v-list-subheader>{{ $t('Retrieving Companies') }}...</v-list-subheader>
        <v-list-item v-for="index in 3" :key="index">
          <v-skeleton-loader type="list-item-avatar"></v-skeleton-loader>
        </v-list-item>
      </span>

      <span v-else>
        <v-list v-if="companies?.length">
          <v-list-subheader>{{ $t('Companies') }}</v-list-subheader>

          <template v-for="company in companies" :key="company.id">
            <CompanyListItem :company="company" />
          </template>
        </v-list>
        <v-list v-else>
          <v-list-item class="text-grey text-center">
            {{ $t('(None)') }}
          </v-list-item>
        </v-list>
      </span>
    </v-card-text>
  </v-card>
</template>
