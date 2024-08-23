<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProfile } from '@/stores/profile'
import { useI18n } from 'vue-i18n'
import { useStep } from '@/stores/step'

const { t } = useI18n()
const profileStore = useProfile()
const stepStore = useStep()

const notifications = computed(() => {
  let pendingInvites = []
  let pendingRequests = []

  if (isClientOrAdmin.value) {
    pendingInvites = pendingTeammates.value
  }

  if (isHelper.value) {
    pendingRequests = stepStore.pendingSteps
  }

  return pendingRequests.length + pendingInvites.length
})

const tab = ref('pending-invites')

const tabs = computed(() => {
  const tabsArray = []

  if (isClientOrAdmin.value) {
    tabsArray.push({
      id: 'pending-invites',
      title: t('Pending Invites'),
    })
  }

  if (isHelper.value) {
    tabsArray.push({
      id: 'pending-requests',
      title: t('Pending Requests'),
    })
  }

  return tabsArray
})

const isClientOrAdmin = computed(() => {
  return roles.value?.includes('CLIENT') || roles.value?.includes('TEAM_ADMIN')
})

const isHelper = computed(() => {
  return roles.value?.includes('HELPER')
})

const pendingTeammates = computed(() => {
  return profileStore.pendingTeammates()
})

const profile = computed(() => {
  return profileStore.profile
})

const roles = computed(() => {
  return profile.value?.roles
})

const teamId = computed(() => {
  return profile.value?.teamId
})

onMounted(async () => {})
</script>

<template>
  <v-menu ref="notificationMenu" offset-y>
    <template #activator="{ props }">
      <v-btn icon v-bind="props">
        <v-badge v-if="notifications > 0" :content="notifications" color="primary">
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell</v-icon>
      </v-btn>
    </template>

    <v-list class="notification-list">
      <v-tabs v-model="tab">
        <v-tab v-for="item in tabs" :key="item.id" :value="item.id">{{ item.title }}</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="pending-requests">
          <RequestList :pending-only="true" />
        </v-window-item>
        <v-window-item value="pending-invites">
          <v-list v-if="pendingTeammates.length">
            <HelperListItem v-for="member in pendingTeammates" :key="member.id" :member="member" />
          </v-list>
          <v-list v-else>
            <v-list-item class="text-grey text-center">
              {{ $t('(None)') }}
            </v-list-item>
          </v-list>
        </v-window-item>
      </v-window>
    </v-list>
  </v-menu>

  <EventRequestListener v-if="isClientOrAdmin" />
  <RequestListener v-if="isHelper" />
</template>

<style lang="scss" scoped>
.notification-list {
  border: 1px solid gray !important;
  width: 600px;
  padding-bottom: 12px;
}
</style>
