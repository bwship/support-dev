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

const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600

const { addToast } = useToasts()
const { t } = useI18n()
const auth = useAuth()
const errorMessage = ref('')
const form = ref(false)
const isLoading = ref(false)
const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const token = route.query.token

const rules = {
  required: (value: string) => !!value || t('Required'),
  password: (value: string) => value.length >= 6 || t('Must be at least 6 characters'),
}

const saveClicked = async () => {
  try {
    if (!form.value) return
    if (password.value != confirmPassword.value) return

    errorMessage.value = ''
    isLoading.value = true

    await auth.setPassword(password.value)

    addToast({ text: t('Welcome to Support.dev'), variant: 'success' })
    router.push({ name: 'requests' })
  } catch (error: any) {
    errorMessage.value = t('An error has occurred: {error}', { error })
    addToast({ text: error.message || error, variant: 'error' })
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
      {{ $t('Set Password') }}
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
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :label="$t('Password')"
              :rules="[rules.required, rules.password]"
              :type="showPassword ? 'text' : 'password'"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="confirmPassword"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :label="$t('Confirm Password')"
              :rules="[rules.required, rules.password]"
              :type="showPassword ? 'text' : 'password'"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>

      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="!form || password != confirmPassword"
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
  </v-card>
</template>
