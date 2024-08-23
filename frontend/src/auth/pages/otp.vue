<route lang="yaml">
meta:
  public: true
</route>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const auth = useAuth()
const { t } = useI18n()
const email = ref('')
const errorMessage = ref('')
const form = ref(false)
const isLoading = ref(false)
const token = ref('')
const router = useRouter()
const isMobile = ref(false)

const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed

const rules = {
  required: (value: string) => !!value || t('Required'),
  otp: (value: string) => value.length >= 6 || t('Must be at least 6 characters'),
}

const submitClicked = async () => {
  try {
    if (token.value?.length < 6) return

    errorMessage.value = ''
    isLoading.value = true

    await auth.loginWithOtp(email.value, token.value)
  } catch (error) {
    errorMessage.value = t('An error has occurred: {error}', { error })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => auth.isAuthenticated,
  (newIsAuthenticated: boolean) => {
    if (newIsAuthenticated) {
      router.push(router.currentRoute.value.query.redirectTo?.toString() || '/events')
    }
  }
)

onMounted(async () => {
  const data = localStorage.getItem('registration-data')

  if (data) {
    const { regEmail } = JSON.parse(data)
    email.value = regEmail
  }

  if (auth.isAuthenticated) {
    // Redirect to the "events" page if authenticated
    router.push({ name: 'events' })
  }

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title>
      {{ $t('Enter OTP Code') }}
    </v-card-title>

    <v-card-subtitle>
      {{ $t('An email has been sent with the verification code.') }}
    </v-card-subtitle>

    <v-divider class="mt-2" />

    <v-card-text>
      <p v-if="errorMessage" class="text-error">
        <i-mdi-alert color="error" />
        {{ $t(errorMessage) }}
      </p>
    </v-card-text>

    <v-form v-model="form" @submit.prevent="submitClicked">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-otp-input
              v-model="token"
              :error="errorMessage?.length"
              :rules="[rules.required, rules.otp]"
            ></v-otp-input>
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <v-card-actions>
      <v-spacer />
      <v-btn
        :disabled="token?.length < 6"
        :loading="isLoading"
        class="mr-2"
        color="primary"
        size="large"
        variant="flat"
        @click="submitClicked"
        ><span class="pa-2">{{ $t('Submit') }}</span></v-btn
      >
    </v-card-actions>

    <v-divider class="mt-6" />
    <v-card-text class="pt-0 pb-5">
      <p class="text-grey-lighten-1" style="margin-top: 20px">
        {{ $t('Already have an account') }}
        <router-link :to="{ name: 'login' }">{{ $t('Log In') }}</router-link>
      </p>
    </v-card-text>
  </v-card>
</template>
