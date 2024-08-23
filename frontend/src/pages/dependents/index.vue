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

const dependents = computed(() => {
  return profileStore.dependents()
})

const isAdministrator = computed(() => {
  return roles?.value?.includes('TEAM_ADMIN')
})

const isClient = computed(() => {
  return roles?.value?.includes('CLIENT')
})

const isClientOrAdministrator = computed(() => {
  return isClient.value || isAdministrator.value
})

const profile = computed(() => {
  return profileStore.profile
})

const roles = computed(() => {
  return profile.value?.roles
})

const refreshDependents = async () => {
  isLoading.value = true

  try {
    await profileStore.fetchTeammates(profile.value?.teamId as number, false)
  } catch (error: any) {
    console.error('Error refreshing dependents:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isLoading.value = false // Set isLoading back to false when done fetching
  }
}

onMounted(async () => {
  profileStore.fetchTeammates(profile.value?.teamId as number)

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0" prepend-icon="mdi-human-male-boy">
    <template #title>
      <v-row>
        <v-col cols="9" class="pt-6">{{ $t('Dependents') }}</v-col>

        <v-col :cols="isMobile ? 'auto' : '3'" class="text-right">
          <v-btn v-if="isClientOrAdministrator" color="primary" @click="showAddDialog = true">
            <i-mdi-plus />
            {{ $t('Add Dependent') }}
          </v-btn>

          <v-dialog v-model="showAddDialog" :fullscreen="isMobile" width="800" persistent>
            <DependentEdit @cancel="showAddDialog = false" />
          </v-dialog>

          <v-btn color="primary" :disabled="isLoading" icon variant="text" @click="refreshDependents"
            ><i-mdi-refresh />
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <v-divider></v-divider>

    <v-card-text>
      <span v-if="isLoading">
        <v-list-subheader>{{ $t('Retrieving Dependents') }}...</v-list-subheader>
        <v-list-item v-for="index in 3" :key="index">
          <v-skeleton-loader type="list-item-avatar"></v-skeleton-loader>
        </v-list-item>
      </span>

      <span v-else>
        <v-list v-if="dependents?.length">
          <DependentListItem v-for="member in dependents" :key="member.id" :dependent="member"></DependentListItem
        ></v-list>
        <v-list v-else>
          <v-list-item class="text-grey text-center">
            {{ $t('(None)') }}
          </v-list-item>
        </v-list>
      </span>
    </v-card-text>
  </v-card>
</template>
