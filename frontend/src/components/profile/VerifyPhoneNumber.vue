<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import useToasts from '@/composables/useToasts'

const { addToast } = useToasts()
const auth = useAuth()
const profileStore = useProfile()
const { t } = useI18n()
const errorMessage = ref('')
const form = ref(false)
const isSaving = ref(false)
const token = ref('')
const showVerifyPhoneNumber = ref(false)

const profile = computed(() => {
  return profileStore.profile
})

const rules = {
  required: (value: string) => !!value || t('Required'),
  otp: (value: string) => value.length >= 6 || t('Must be at least 6 characters'),
}

const submitClicked = async () => {
  try {
    if (token.value?.length < 6) return

    errorMessage.value = ''
    isSaving.value = true

    await auth.verifySmsOtp(profile.value?.phoneNumber as string, token.value)
  } catch (error) {
    errorMessage.value = t('An error has occurred: {error}', { error })
  } finally {
    isSaving.value = false
  }
}

const resendCodeClicked = async () => {
  try {
    await auth.sendSmsOtp(profile.value?.phoneNumber as string)
    addToast({ text: t('SMS sent'), variant: 'success' })
  } catch (error) {
    errorMessage.value = t('An error has occurred: {error}', { error })
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {})
</script>

<template>
  <v-btn color="primary" class="ml-2" @click="showVerifyPhoneNumber = true">
    <i-mdi-cellphone />
    {{ $t('Verify Phone Number') }}
  </v-btn>

  <v-dialog v-model="showVerifyPhoneNumber" width="500" persistent>
    <v-card>
      <v-card-title>
        {{ $t('Enter OTP Code') }}
      </v-card-title>

      <v-card-subtitle>
        {{ $t('An SMS has been sent with the verification code.') }}
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
      <v-divider />

      <v-card-actions class="mb-2 mr-2">
        <v-btn :disabled="isSaving" class="ml-2" color="primary" @click="resendCodeClicked"
          ><i-mdi-phone class="mr-2" />{{ $t('Resend Code') }}</v-btn
        >

        <v-spacer />
        <v-btn :text="$t('Cancel')" :disabled="isSaving" @click="showVerifyPhoneNumber = false"></v-btn>
        <v-btn
          :disabled="isSaving || token?.length < 6"
          :loading="isSaving"
          color="primary"
          variant="flat"
          @click="submitClicked"
          ><span class="pa-2">{{ $t('Submit') }}</span></v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
