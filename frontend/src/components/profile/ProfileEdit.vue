<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import useToasts from '@/composables/useToasts'
import { useEnum } from '@/stores/enum'

const props = defineProps<{
  id?: number
}>()

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'update', id?: number): void
}>()

const { addToast } = useToasts()

const auth = useAuth()
const isSaving = ref(false)
const profileStore = useProfile()
const enumStore = useEnum()
const { t } = useI18n()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const foodAllergies = ref('')
const foodPreferences = ref('')
const phoneNumber = ref('')
const receiveEmailMessages = ref(false)
const receivePushMessages = ref(false)
const receiveSmsMessages = ref(false)
const selectedResponseTypes = ref<string[]>([])
const selectedTransportationRules = ref<string[]>([])

const isClientOrAdmin = computed(() => {
  return roles?.value?.includes('CLIENT') || roles?.value?.includes('TEAM_ADMIN')
})

const availableTransportationRules = computed(() => {
  return enumStore._transportationRules.map((a) => a.id)
})

const isHelperOrAdmin = computed(() => {
  return roles?.value?.includes('HELPER') || roles?.value?.includes('TEAM_ADMIN')
})

const profile = computed(() => {
  return profileStore.profile
})

const requestTypes = computed(() => {
  return profile.value?.relationshipAttributes?.requestTypes || []
})

const roles = computed(() => {
  return profile.value?.roles
})

const cancelClicked = async () => {
  emit('cancel', props.id)
}

const saveClicked = async () => {
  try {
    isSaving.value = true

    if (profile.value) {
      const tempProfile = { ...profile.value }
      tempProfile.firstName = firstName.value
      tempProfile.lastName = lastName.value
      tempProfile.attributes.foodAllergyDescription = foodAllergies.value
      tempProfile.attributes.foodPreferencesDescription = foodPreferences.value
      tempProfile.attributes.receiveEmailMessages = receiveEmailMessages.value
      tempProfile.attributes.receivePushMessages = receivePushMessages.value
      tempProfile.attributes.receiveSmsMessages = receiveSmsMessages.value

      if (isClientOrAdmin.value && selectedTransportationRules.value) {
        tempProfile.attributes.transportationRules = selectedTransportationRules.value
      }

      if (isHelperOrAdmin.value) {
        tempProfile.relationshipAttributes = {
          ...(profile.value.relationshipAttributes || {}), // Preserve other attributes if they exist
          responseTypes: selectedResponseTypes.value,
        }
      }

      if (phoneNumber.value) {
        await auth.setPhoneNumber(phoneNumber.value)
      }

      await profileStore.upsert(tempProfile)
    }

    addToast({ text: t('Profile updated successfully'), variant: 'success' })

    if (profile.value?.userId) {
      await profileStore.fetchProfile(profile.value.userId, false)
    }

    await cancelClicked()
  } catch (error: any) {
    console.error('Error creating address:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

function setData() {
  const tempProfile = profile.value

  if (tempProfile) {
    firstName.value = tempProfile?.firstName
    lastName.value = tempProfile.lastName || ''
    email.value = tempProfile.email || ''
    phoneNumber.value = tempProfile.phoneNumber || ''
    foodAllergies.value = tempProfile.attributes.foodAllergyDescription || ''
    foodPreferences.value = tempProfile.attributes.foodPreferencesDescription || ''
    receiveEmailMessages.value = tempProfile.attributes.receiveEmailMessages || false
    receivePushMessages.value = tempProfile.attributes.receivePushMessages || false
    receiveSmsMessages.value = tempProfile.attributes.receiveSmsMessages || false

    tempProfile.relationshipAttributes?.responseTypes?.forEach((a) => {
      selectedResponseTypes.value.push(a)
    })

    tempProfile.attributes.transportationRules?.forEach((a) => {
      selectedTransportationRules.value.push(a)
    })
  }
}

onMounted(async () => {
  enumStore.fetchTransportationRules()

  setData()
})
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <v-btn color="primary" variant="text" text :disabled="isSaving" @click="cancelClicked">Cancel</v-btn>

      <span class="text-center">{{ $t('Edit Profile') }}</span>

      <v-btn color="primary" :disabled="isSaving" :loading="isSaving" @click="saveClicked">
        <i-mdi-content-save />{{ $t('Save') }}</v-btn
      >
    </v-card-title>
    <v-divider />

    <v-card-text>
      <v-form>
        <h5>{{ $t('Basic Information') }}</h5>
        <v-divider />

        <v-row>
          <v-col>
            <v-text-field v-model="firstName" :label="$t('First Name')"></v-text-field>
          </v-col>
          <v-col>
            <v-text-field v-model="lastName" :label="$t('Last Name')"></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-text-field v-model="email" :label="$t('Email')"></v-text-field>
          </v-col>
          <v-col>
            <v-text-field v-model="phoneNumber" :label="$t('Phone Number')"></v-text-field>
          </v-col>
        </v-row>

        <span>
          <h5>{{ $t('Notifications') }}</h5>
          <v-divider />

          <v-row class="pl-4">
            <v-switch v-model="receiveEmailMessages" :label="t('Email')" color="primary" hide-details></v-switch>
            <v-switch
              v-model="receivePushMessages"
              :label="t('Push Notifications')"
              color="primary"
              hide-details
            ></v-switch>

            <v-switch v-model="receiveSmsMessages" :label="t('SMS')" color="primary" hide-details></v-switch>
          </v-row>
        </span>

        <!-- Transportation Rules -->
        <span v-if="isClientOrAdmin">
          <h5>{{ $t('Transportation Rules') }}</h5>
          <v-divider />

          <v-row class="pl-4">
            <v-switch
              v-for="ruleId in availableTransportationRules"
              :key="ruleId"
              v-model="selectedTransportationRules"
              :value="ruleId"
              :label="t(ruleId)"
              color="primary"
              hide-details
            ></v-switch>
          </v-row>
        </span>

        <!-- Food Allergies -->
        <span v-if="isClientOrAdmin">
          <h5>{{ $t('Food Allergies') }}</h5>
          <v-divider />

          <v-textarea v-model="foodAllergies"></v-textarea>

          <h5>{{ $t('Food Preferences') }}</h5>
          <v-divider />

          <v-textarea v-model="foodPreferences"></v-textarea>
        </span>

        <!-- Services Offered -->
        <span v-if="isHelperOrAdmin">
          <h5>{{ $t('Services Offered') }}</h5>
          <v-divider />

          <v-row class="ml-4 pl-4">
            <v-switch
              v-for="service in requestTypes"
              :key="service"
              v-model="selectedResponseTypes"
              :label="$t(service)"
              :value="service"
              color="primary"
              hide-details
            ></v-switch>
          </v-row>
        </span>
      </v-form>
    </v-card-text>
  </v-card>
</template>
