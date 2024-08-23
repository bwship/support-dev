import { computed, onMounted } from 'vue'
import { RouteLocationRaw, Router } from 'vue-router'
import { RequiredAuthOptions } from './types'
import { useAuth } from './useAuth'
import { useProfile } from '@/stores/profile'

export function configureNavigationGuards(router: Router, options: RequiredAuthOptions) {
  const auth = useAuth()
  const profileStore = useProfile()

  router.beforeEach(async (to): Promise<boolean | RouteLocationRaw> => {
    await auth.retrieveSession()

    if (auth.user.id) {
      await profileStore.fetchProfile(auth.user.id as string)
    }

    const isClientOrAdmin = computed(() => {
      const roles = profileStore.profile?.roles
      return roles?.includes('CLIENT') || roles?.includes('TEAM_ADMIN')
    })

    if (to.name === options.loginRouteName) {
      if (auth.isAuthenticated) {
        return options.loginRedirectRoute
      }
      return true
    }

    if (!to.meta.public) {
      if (!auth.isAuthenticated) {
        return { name: options.loginRouteName, query: { redirectTo: to.fullPath } }
      } else {
        // Check if user is not a client or admin
        if (!isClientOrAdmin.value) {
          // Check if navigating to the events page
          if (to.name === 'events') {
            return { name: 'requests' }
          }
        }
      }
    }

    return true
  })
}
