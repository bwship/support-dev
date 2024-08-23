<route lang="yaml">
meta:
  public: true
</route>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useToasts from '@/composables/useToasts'

const auth = useAuth()
const { addToast } = useToasts()
const { t } = useI18n()
const email = ref('')
const errorMessage = ref('')
const form = ref(false)
const isLoading = ref(false)
const router = useRouter()
const isMobile = ref(false)

const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed

const rules = {
  required: (value: string) => !!value || t('Required'),
  password: (value: string) => value.length >= 6 || t('Must be at least 6 characters'),
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(value) || t('Invalid e-mail')
  },
}

const submitClicked = async () => {
  try {
    if (!form.value) return

    errorMessage.value = ''
    isLoading.value = true

    await auth.preregister(email.value)

    email.value = ''

    addToast({
      text: t('Thank you for preregistering for Support.dev. We will be in contact shortly.'),
      variant: 'success',
    })
  } catch (error: any) {
    errorMessage.value = t('An error has occurred: {error}', { error })
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => auth.isAuthenticated,
  (newIsAuthenticated: boolean) => {
    if (newIsAuthenticated) {
      router.push(router.currentRoute.value.query.redirectTo?.toString() || { name: 'events' })
    }
  }
)

onMounted(async () => {
  if (auth.isAuthenticated) {
    // Redirect to the "events" page if authenticated
    router.push('/events') // Replace '/events' with your desired URL
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
      {{ $t('Preregister for Beta') }}
    </v-card-title>

    <v-card-subtitle>
      {{ $t('Launching March 28th, 2024') }}
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
            <v-text-field
              v-model="email"
              :rules="[rules.required, rules.email]"
              placeholder="jenny@me.com"
              :label="$t('Email')"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>

      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="!form"
          :loading="isLoading"
          type="submit"
          class="mr-2"
          color="primary"
          size="large"
          variant="flat"
          ><span class="pa-2">{{ $t('Submit') }}</span></v-btn
        >
      </v-card-actions>
    </v-form>

    <v-divider class="mt-6" />

    <v-card-text class="pt-0 pb-5">
      <p class="text-grey-lighten-1" style="margin-top: 20px">
        {{ $t('Already have an account') }}
        <router-link :to="{ name: 'login' }">{{ $t('Log In') }}</router-link>
      </p>
    </v-card-text>
  </v-card>
</template>
