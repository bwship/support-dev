<route lang="yaml">
meta:
  public: true
</route>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import useToasts from '@/composables/useToasts'

const auth = useAuth()
const { t } = useI18n()

const { addToast } = useToasts()
const errorMessage = ref('')
const form = ref(false)
const isLoading = ref(false)
const isMobile = ref(false)
const password = ref('')
const route = useRoute()
const router = useRouter()
const showPassword = ref(false)
const token = route.query.token

const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed

const rules = {
  required: (value: string) => !!value || t('Required'),
  password: (value: string) => value.length >= 6 || t('Must be at least 6 characters'),
}

const saveClicked = async () => {
  try {
    if (!form.value) return

    isLoading.value = true

    await auth.setPassword(password.value)
    addToast({ text: t('Your password has been reset'), variant: 'success' })

    router.push({ name: 'events' })
  } catch (error) {
    errorMessage.value = t('An error has occurred: {error}', { error })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await auth.loginWithToken(token as string)

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
      {{ $t('Reset Password') }}
    </v-card-title>

    <v-card-text>
      <p v-if="errorMessage" class="text-error">
        <i-mdi-alert color="error" />
        {{ $t(errorMessage) }}
      </p>
    </v-card-text>

    <v-form v-model="form" @submit.prevent="saveClicked">
      <v-container>
        <v-row>
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
          ><span class="pa-2">{{ $t('Save') }}</span></v-btn
        >
      </v-card-actions>
    </v-form>

    <v-card-text class="pb-0">
      <v-divider />
      <p class="text-grey-lighten-1" style="margin-top: 20px">
        {{ $t('Already have an account') }}
        <router-link :to="{ name: 'login' }">{{ $t('Log In') }}</router-link>
      </p>
    </v-card-text>
  </v-card>
</template>
