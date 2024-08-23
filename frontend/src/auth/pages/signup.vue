<route lang="yaml">
meta:
  public: true
</route>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useToasts from '@/composables/useToasts'

const auth = useAuth()
const { addToast } = useToasts()
const { t } = useI18n()
const agreeToTerms = ref(false)
const email = ref('')
const errorMessage = ref('')
const form = ref(false)
const firstName = ref('')
const isLoading = ref(false)
const lastName = ref('')
const password = ref('')
const router = useRouter()
const showPassword = ref(false)
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

const openPrivacyPolicy = () => {
  // Open the privacy policy in a new window or tab
  window.open('https://support.dev/privacy-policy', '_blank')
}

const openTermsOfUse = () => {
  // Open the terms of use in a new window or tab
  window.open('https://support.dev/terms-and-conditions', '_blank')
}

const signupClicked = async () => {
  const emailRegistrationValid = await auth.validateRegistration(email.value)

  if (emailRegistrationValid) {
    try {
      if (!form.value) return

      errorMessage.value = ''
      isLoading.value = true

      await auth.signup(firstName.value, lastName.value, email.value, password.value)
      addToast({ text: t('Welcome to Support.dev.'), variant: 'success' })
      router.push({ name: 'otp' })
    } catch (error) {
      errorMessage.value = t('An error has occurred: {error}', { error })
    } finally {
      isLoading.value = false
    }
  } else if (!emailRegistrationValid) {
    addToast({
      text: t('Unable to sign up at this time. Please signup for the beta at support.dev'),
      variant: 'warning',
    })
  }
}

onMounted(async () => {
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
      {{ $t('Sign Up') }}
    </v-card-title>
    <v-divider class="mt-2" />

    <v-card-text>
      <p v-if="errorMessage" class="text-error">
        <i-mdi-alert color="error" />
        {{ $t(errorMessage) }}
      </p>
    </v-card-text>

    <v-form v-model="form" @submit.prevent="signupClicked">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="firstName"
              :rules="[rules.required]"
              :label="$t('First Name')"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="lastName" :rules="[rules.required]" :label="$t('Last Name')" required></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="email"
              :rules="[rules.required, rules.email]"
              :label="$t('Email')"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :label="$t('Password')"
              :rules="[rules.required, rules.password]"
              required
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>
          </v-col>

          <v-col cols="12" style="margin-top: -22px; margin-left: -10px">
            <!-- Checkbox for agreeing to terms -->
            <v-checkbox v-model="agreeToTerms" :rules="[rules.required]">
              <template #label>
                <p>
                  {{ $t('I agree to the') }}
                  <a href="#" @click.prevent="openPrivacyPolicy">{{ $t('privacy policy') }}</a>
                  <span class="mx-1"> {{ $t('and') }} </span>
                  <a href="#" @click.prevent="openTermsOfUse">{{ $t('terms of use') }}</a>
                </p>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
      </v-container>

      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="!form"
          :loading="isLoading"
          class="mr-2"
          type="submit"
          color="primary"
          size="large"
          variant="flat"
          @click="signupClicked"
          >{{ $t('Sign Up') }}</v-btn
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
