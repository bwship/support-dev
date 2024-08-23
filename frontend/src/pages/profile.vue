<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/auth/useAuth'
import { useProfile } from '@/stores/profile'
import useToasts from '@/composables/useToasts'
import VerifyPhoneNumber from '@/components/profile/VerifyPhoneNumber.vue'

const { addToast } = useToasts()
const auth = useAuth()
const { t } = useI18n()
const isLoading = ref(false)
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const showEditDialog = ref(false)
const showLanguageDialog = ref(false)
const showThemeDialog = ref(false)

const foodAllergies = computed(() => {
  return profile.value?.attributes.foodAllergyDescription
})

const foodPreferences = computed(() => {
  return profile.value?.attributes.foodPreferencesDescription
})

const isClientOrAdmin = computed(() => {
  return roles?.value?.includes('CLIENT') || roles?.value?.includes('TEAM_ADMIN')
})

const isHelperOrAdmin = computed(() => {
  return roles?.value?.includes('HELPER') || roles?.value?.includes('TEAM_ADMIN')
})

const transportationRules = computed(() => {
  return profile.value?.attributes.transportationRules
})

const email = computed(() => {
  return profile.value?.email
})

const firstName = computed(() => {
  return profile.value?.firstName
})

const language = computed(() => {
  return profile.value?.attributes.language || 'en'
})

const lastName = computed(() => {
  return profile.value?.lastName
})

const id = computed(() => {
  return profile.value?.id
})

const phoneNumber = computed(() => {
  return profile.value?.phoneNumber
})

const profile = computed(() => {
  return profileStore.profile
})

const receiveEmailMessages = computed(() => {
  return profile.value?.attributes.receiveEmailMessages || false
})

const receivePushMessages = computed(() => {
  return profile.value?.attributes.receivePushMessages || false
})

const receiveSmsMessages = computed(() => {
  return profile.value?.attributes.receiveSmsMessages || false
})

const requestTypes = computed(() => {
  return profile.value?.relationshipAttributes?.requestTypes
})

const responseTypes = computed(() => {
  return profile.value?.relationshipAttributes?.responseTypes
})

const roles = computed(() => {
  return profile.value?.roles
})

const theme = computed(() => {
  return profile.value?.attributes.theme || 'darkTheme'
})

const refreshProfile = async () => {
  isLoading.value = true

  try {
    await profileStore.fetchProfile(auth.user.id as string, false)
  } catch (error: any) {
    console.error('Error refreshing profile:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isLoading.value = false // Set isLoading back to false when done fetching
  }
}

onMounted(async () => {
  await profileStore.fetchProfile(auth.user.id as string, false)

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0" prepend-icon="mdi-calendar">
    <template #title>
      <v-row>
        <v-col cols="8" class="pt-6">{{ $t('My Profile') }}</v-col>

        <v-col cols="4" class="text-right">
          <VerifyPhoneNumber v-if="phoneNumber && profile?.isPhonePending" />

          <v-btn variant="text" color="primary" @click="showEditDialog = true">
            <i-mdi-pencil class="mr-1" />
            {{ $t('Edit') }}
          </v-btn>

          <v-dialog v-model="showEditDialog" :fullscreen="isMobile" width="800" persistent>
            <ProfileEdit :id="id" @cancel="showEditDialog = false" />
          </v-dialog>

          <v-btn class="ml-2" color="primary" icon :loading="isLoading" variant="text" @click="refreshProfile"
            ><i-mdi-refresh
          /></v-btn>
        </v-col>
      </v-row>
    </template>
    <v-divider></v-divider>

    <v-card-text v-if="profile" class="text-center">
      <ProfileImageUpload :profile="profile" :enable-edit="true" />
    </v-card-text>
    <v-divider />

    <v-card-text class="pb-16 pl-12 pr-12 pt-0">
      <v-list>
        <v-list-subheader>{{ $t('Basic Information') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-col>
            <Attribute :title="$t('First Name')" :value="firstName" />
            <Attribute :title="$t('Last Name')" :value="lastName" />
            <Attribute :title="$t('Email')" :value="email" />
            <Attribute :title="$t('Phone')" :value="phoneNumber" />
          </v-col>
        </v-list-item>

        <!-- Notifications -->
        <v-list-subheader>{{ $t('Notifications') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <v-chip v-if="receiveEmailMessages" class="mr-2">
                <i-mdi-email />
                {{ receiveEmailMessages ? $t('Email') : $t('') }}
              </v-chip>

              <v-chip v-if="receivePushMessages" class="mr-2">
                <i-mdi-chat />
                {{ receivePushMessages ? $t('Push') : $t('') }}
              </v-chip>

              <v-chip v-if="receiveSmsMessages" class="mr-2">
                <i-mdi-sms />
                {{ receiveSmsMessages ? $t('SMS') : $t('') }}
              </v-chip>

              <p
                v-else-if="!receiveEmailMessages && !receivePushMessages && !receiveSmsMessages"
                class="text-center text-grey"
              >
                ({{ t('None') }})
              </p>
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Transportation Rules -->
        <v-list-subheader>{{ $t('Transportation Rules') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <p v-if="transportationRules && transportationRules.length">
                <v-chip v-for="rule in transportationRules" :key="rule" class="mr-2">
                  {{ $t(rule) }}
                </v-chip>
              </p>
              <p v-else class="text-center text-grey">({{ $t('None') }})</p>
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Roles -->
        <v-list-subheader>{{ $t('Roles') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <v-chip v-for="role in roles" :key="role" class="mr-2">
                <i-mdi-person />
                {{ $t(role) }}
              </v-chip>
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Food Allergies - Client or Admin Only -->
        <span v-if="isClientOrAdmin">
          <v-list-subheader>{{ $t('Food Allergies') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <v-row>
              <v-col cols="auto">
                <p v-if="foodAllergies">{{ foodAllergies }}</p>
                <p v-else class="text-center text-grey">({{ $t('None') }})</p>
              </v-col>
            </v-row>
          </v-list-item>
        </span>

        <!-- Food Preferences - Client or Admin Only -->
        <span v-if="isClientOrAdmin">
          <v-list-subheader>{{ $t('Food Preferences') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <v-row>
              <v-col cols="auto">
                <p v-if="foodPreferences">{{ foodPreferences }}</p>
                <p v-else class="text-center text-grey">({{ $t('None') }})</p>
              </v-col>
            </v-row>
          </v-list-item>
        </span>

        <!-- Service Requests - Helper or Admin Only -->
        <span v-if="isHelperOrAdmin">
          <v-list-subheader>{{ $t('Service Requests') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <v-row>
              <v-col cols="auto">
                <span v-if="requestTypes?.length">
                  <v-chip v-for="type in requestTypes.sort()" :key="type" class="mr-2">
                    <i-mdi-human-male-boy v-if="type == 'CHILD_CARE'" />
                    <i-mdi-silverware v-if="type == 'MEAL'" />
                    <i-mdi-car v-if="type == 'TRANSPORTATION'" />
                    {{ $t(type) }}
                  </v-chip>
                </span>
                <span v-else class="text-center text-grey">({{ t('None') }})</span>
              </v-col>
            </v-row>
          </v-list-item>
        </span>

        <!-- Service Accepted - Helper or Admin Only -->
        <span v-if="isHelperOrAdmin">
          <v-list-subheader>{{ $t('Services Accepted') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <v-row>
              <v-col cols="auto">
                <span v-if="responseTypes?.length">
                  <v-chip v-for="type in responseTypes.sort()" :key="type" class="mr-2">
                    <i-mdi-human-male-boy v-if="type == 'CHILD_CARE'" />
                    <i-mdi-silverware v-if="type == 'MEAL'" />
                    <i-mdi-car v-if="type == 'TRANSPORTATION'" />
                    {{ $t(type) }}
                  </v-chip>
                </span>
                <span v-else class="text-center text-grey">({{ t('None') }})</span>
              </v-col>
            </v-row>
          </v-list-item>
        </span>

        <!-- System Settings -->
        <v-list-subheader>{{ $t('System Settings') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <v-chip @click="showLanguageDialog = true">{{ $t('Language') }}: {{ $t(language) }}</v-chip>
              <v-chip @click="showThemeDialog = true">{{ $t('Theme') }}: {{ $t(theme) }}</v-chip>
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Danger Zone -->
        <span v-if="false">
          <v-list-subheader class="text-error">{{ $t('Danger Zone') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <v-row v-if="false" class="ml-8">
              <v-col cols="auto">
                <v-btn color="error" variant="outlined" @click="refreshProfile"
                  ><i-mdi-trash />{{ $t('Delete Account') }}</v-btn
                >
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="auto">
                <v-btn class="ml-2" color="error" icon :loading="isLoading" variant="outlined" @click="refreshProfile"
                  ><i-mdi-refresh />{{ $t('Refresh') }}</v-btn
                >
              </v-col>
            </v-row>
          </v-list-item>
        </span>
      </v-list>
    </v-card-text>

    <v-dialog v-model="showLanguageDialog" width="400" persistent>
      <ChooseLanguageDialog :id="id" @cancel="showLanguageDialog = false" />
    </v-dialog>

    <v-dialog v-model="showThemeDialog" width="400" persistent>
      <ChooseThemeDialog :id="id" @cancel="showThemeDialog = false" />
    </v-dialog>
  </v-card>
</template>
