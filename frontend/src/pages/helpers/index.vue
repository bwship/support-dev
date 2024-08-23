<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import useToasts from '@/composables/useToasts'

const { addToast } = useToasts()
const auth = useAuth()
const isLoading = ref(false)
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const { t } = useI18n()
const showAddDialog = ref(false)

const profile = computed(() => {
  return profileStore.profile
})

const roles = computed(() => {
  return profile.value?.roles
})

const isHelper = computed(() => {
  return roles?.value?.includes('HELPER')
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

const admins = computed(() => {
  return profileStore.admins().filter((a) => a.id != auth.user.id)
})

const clients = computed(() => {
  return profileStore.clients().filter((a) => a.id != auth.user.id)
})

const helpers = computed(() => {
  return profileStore.helpers().filter((a) => a.id != auth.user.id)
})

const isHelpersVisible = computed(() => {
  return isClient.value || isAdministrator.value
})

const isAdminsVisible = computed(() => {
  return isClient.value || isAdministrator.value
})

const isPatientsVisible = computed(() => {
  return isAdministrator.value || isHelper.value
})

const refreshHelpers = async () => {
  isLoading.value = true

  try {
    await profileStore.fetchTeammates(profile.value?.teamId as number, false)
  } catch (error: any) {
    console.error('Error refreshing helpers:', error)
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
  <v-card class="mx-auto full-height" elevation="0" prepend-icon="mdi-account-group">
    <template #title>
      <v-row>
        <v-col cols="9" class="pt-6">{{ $t('Helpers') }}</v-col>

        <v-col :cols="isMobile ? 'auto' : '3'" class="text-right">
          <v-btn v-if="isClientOrAdministrator" color="primary" @click="showAddDialog = true">
            <i-mdi-email />
            {{ $t('Invite Helper') }}
          </v-btn>

          <v-dialog v-model="showAddDialog" :fullscreen="isMobile" width="800" persistent>
            <HelperEdit @cancel="showAddDialog = false" />
          </v-dialog>

          <v-btn color="primary" :disabled="isLoading" icon variant="text" @click="refreshHelpers"
            ><i-mdi-refresh />
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <v-divider></v-divider>

    <v-card-text>
      <span v-if="isLoading">
        <v-list-subheader>{{ $t('Retrieving Helpers') }}...</v-list-subheader>
        <v-list-item v-for="index in 3" :key="index">
          <v-skeleton-loader type="list-item-avatar"></v-skeleton-loader>
        </v-list-item>
      </span>

      <span v-else>
        <v-list v-if="helpers?.length && isHelpersVisible">
          <v-list-subheader>{{ t('Helpers') }}</v-list-subheader>
          <HelperListItem v-for="member in helpers" :key="member.id" :member="member" />
        </v-list>
        <v-list v-else-if="isHelpersVisible">
          <v-list-subheader>{{ t('Helpers') }}</v-list-subheader>
          <v-list-item class="text-grey text-center">
            {{ $t('(None)') }}
          </v-list-item>
        </v-list>

        <v-list v-if="admins?.length && isAdminsVisible">
          <v-list-subheader>{{ t('Administrators') }}</v-list-subheader>
          <HelperListItem v-for="member in admins" :key="member.id" :member="member"></HelperListItem
        ></v-list>
        <v-list v-else-if="isAdminsVisible">
          <v-list-subheader>{{ t('Administrators') }}</v-list-subheader>
          <v-list-item class="text-grey text-center">
            {{ $t('(None)') }}
          </v-list-item>
        </v-list>

        <v-list v-if="clients?.length && isPatientsVisible">
          <v-list-subheader>{{ t('Patients') }}</v-list-subheader>
          <HelperListItem v-for="member in clients" :key="member.id" :member="member"></HelperListItem
        ></v-list>
        <v-list v-else-if="isPatientsVisible">
          <v-list-subheader>{{ t('Patients') }}</v-list-subheader>
          <v-list-item class="text-grey text-center">
            {{ $t('(None)') }}
          </v-list-item>
        </v-list>
      </span>
    </v-card-text>
  </v-card>
</template>
