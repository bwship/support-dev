<route lang="yaml">
meta:
  public: true
</route>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAuth } from '@/auth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'

const auth = useAuth()
const { t } = useI18n()
const profileStore = useProfile()

const profile = computed(() => {
  return profileStore.profile
})

const welcomeMessage = computed(() => {
  const name = profile.value?.firstName

  if (name) {
    return `${t('Welcome back')}, ${name}`
  }

  return t('Welcome back')
})

watch(
  () => auth.isAuthenticated,
  (newIsAuthenticated: boolean) => {
    if (newIsAuthenticated) {
      const userId = auth.user.id
      profileStore.fetchProfile(userId as string)
    }
  }
)
</script>

<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title>
      {{ $t('Support.dev') }}
    </v-card-title>

    <v-card-subtitle>
      {{ $tc('Helping you on your cancer journey.') }}
    </v-card-subtitle>

    <v-divider class="mt-2" />

    <v-card-actions style="min-height: 200px">
      <v-spacer />
      <span v-if="!auth.isAuthenticated" class="mt-5 pb-0">
        <v-btn class="mr-3" size="large" color="primary" :to="{ name: 'signup' }" variant="elevated"
          ><span class="pa-2">{{ t('Sign Up') }}</span></v-btn
        >

        <v-btn v-if="false" class="mr-3" size="large" color="primary" :to="{ name: 'signup' }" variant="elevated">{{
          t('Sign Up')
        }}</v-btn>
        <v-btn class="ml-3" size="large" color="primary" rounded :to="{ name: 'login' }" variant="outlined"
          ><span class="pa-2">{{ t('Log In') }}</span></v-btn
        >
      </span>
      <span v-else class="text-center pb-4">
        <i-mdi-human-greeting /> {{ welcomeMessage }}<br />

        <v-btn class="mt-8" size="large" color="primary" :to="{ name: 'events' }" variant="elevated">{{
          t('Go to Dashboard')
        }}</v-btn>
      </span>
      <v-spacer />
    </v-card-actions>

    <v-divider v-if="!auth.isAuthenticated" />

    <v-card-text v-if="!auth.isAuthenticated" class="pb-0">
      <v-row>
        <v-col>
          <ChooseLanguage />
        </v-col>
        <v-col>
          <ChooseTheme />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
