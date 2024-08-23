<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { ref } from 'vue'
import { useAuth } from '@/auth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'

// Define a type for the navigation items
type NavItem = {
  name: string
  to: { name: string }
  icon: string
  title: string
} | null

const auth = useAuth()
const drawer = ref(true)
const isMobile = ref(false)
const profileStore = useProfile()
const bottomNavItems = ref<NavItem[]>([])
const sideNavItems = ref<NavItem[]>([])
const { t } = useI18n()

const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed

const isAdmin = computed(() => {
  return roles?.value?.includes('ADMIN')
})

const isClientOrTeamAdmin = computed(() => {
  return roles?.value?.includes('CLIENT') || roles?.value?.includes('TEAM_ADMIN')
})

const isHelperOrTeamAdmin = computed(() => {
  return roles?.value?.includes('HELPER') || roles?.value?.includes('TEAM_ADMIN')
})

const profile = computed(() => {
  return profileStore.profile
})

const roles = computed(() => {
  return profile.value?.roles
})

watch(roles, () => {
  // Update the navigation items based on the roles
  bottomNavItems.value = [
    isClientOrTeamAdmin.value
      ? { name: 'events', to: { name: 'events' }, icon: 'mdi-calendar-clock', title: 'Events' }
      : null,
    isHelperOrTeamAdmin.value
      ? { name: 'requests', to: { name: 'requests' }, icon: 'mdi-hand-wave', title: 'Requests' }
      : null,
    isHelperOrTeamAdmin.value || isClientOrTeamAdmin.value
      ? { name: 'contacts', to: { name: 'contacts' }, icon: 'mdi-account-group', title: 'Contacts' }
      : null,
    { name: 'profile', to: { name: 'profile' }, icon: 'mdi-account-multiple', title: 'Profile' },
  ].filter((item) => item)

  sideNavItems.value = [
    isAdmin.value ? { name: 'companies', to: { name: 'companies' }, icon: 'mdi-domain', title: t('Companies') } : null,
    isClientOrTeamAdmin.value
      ? { name: 'events', to: { name: 'events' }, icon: 'mdi-calendar-clock', title: t('Events') }
      : null,
    isClientOrTeamAdmin.value || isAdmin.value
      ? { name: 'meals', to: { name: 'meals' }, icon: 'mdi-silverware', title: t('Meal Locator') }
      : null,
    isHelperOrTeamAdmin.value
      ? { name: 'requests', to: { name: 'requests' }, icon: 'mdi-hand-wave', title: t('Requests') }
      : null,
    isHelperOrTeamAdmin.value || isClientOrTeamAdmin.value
      ? { name: 'contacts', to: { name: 'contacts' }, icon: 'mdi-account-group', title: t('Contacts') }
      : null,
  ].filter((item) => item)
})

onMounted(async () => {
  const userId = auth.user.id
  await profileStore.fetchProfile(userId as string, false)

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})

onBeforeUnmount(() => {
  // Remove the resize event listener when the component is unmounted
  window.removeEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-app>
    <v-app-bar v-if="!isMobile" :elevation="2" prominent color="background">
      <template v-if="!isMobile" #prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer">
          <img alt="Support.dev" src="@/assets/icon.svg" style="height: 36px" />
        </v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>{{ $t('Support.dev') }}</v-app-bar-title>

      <v-row class="text-right">
        <v-col class="mr-4">
          <Notifications />
          <TopMenu />
        </v-col>
      </v-row>
    </v-app-bar>

    <!-- Desktop Side Navigation -->
    <v-navigation-drawer v-if="!isMobile" v-model="drawer">
      <v-list>
        <v-list-subheader>{{ $t('Navigation') }}</v-list-subheader>

        <template v-for="item in sideNavItems" :key="item.name">
          <v-list-item v-if="item" :to="item.to">
            <template #prepend>
              <v-icon :icon="item.icon" class="mr-2" />
            </template>

            <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Mobile Bottom Navigation -->
    <v-bottom-navigation v-else>
      <template v-for="item in bottomNavItems" :key="item.name">
        <v-btn v-if="item" :to="item.to">
          <v-icon :icon="item.icon" />
          <span>{{ $t(item.title) }}</span>
        </v-btn>
      </template>
    </v-bottom-navigation>

    <v-main class="pt-20">
      <ServiceResponseBanner />
      <RouterViewTransition></RouterViewTransition>
    </v-main>
  </v-app>
</template>
