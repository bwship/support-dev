<route lang="yaml">
meta:
  public: true
</route>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import useToasts from '@/composables/useToasts'

const { addToast } = useToasts()
const auth = useAuth()
const { t } = useI18n()
const email = ref('')
const errorMessage = ref('')
const form = ref(false)
const isLoading = ref(false)
const isMobile = ref(false)

const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed

const rules = {
  required: (value: string) => !!value || t('Required'),
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(value) || t('Invalid e-mail')
  },
}

const sendEmailClicked = async () => {
  try {
    if (!form.value) return

    isLoading.value = true

    await auth.resetPassword(email.value)

    email.value = ''
    addToast({ text: t('Email sent successfully'), variant: 'success' })
  } catch (error: any) {
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isLoading.value = false
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
      {{ $t('Forgot Password') }}
    </v-card-title>
    <v-divider class="mt-2" />

    <v-card-text>
      <p v-if="$route.query.redirectTo" class="text-error">
        <i-mdi-alert color="error" />
        {{ $t('You need to be Authenticated in order to see this page') }}
      </p>

      <p v-if="errorMessage" class="text-error">
        <i-mdi-alert color="error" />
        {{ $t(errorMessage) }}
      </p>
    </v-card-text>

    <v-form v-model="form" @submit.prevent="sendEmailClicked">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="email"
              :rules="[rules.required, rules.email]"
              placeholder="joe@email.com"
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
          ><span class="pa-2">{{ $t('Send Email') }}</span></v-btn
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
