<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useProfile } from '@/stores/profile'
import { useEnum } from '@/stores/enum'
import { addToast } from '@/composables/useToasts'

const route = useRoute()
const { t } = useI18n()
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const showEditDialog = ref(false)
const router = useRouter()
const enumStore = useEnum()

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})
const id = computed(() => {
  return Number(props.id || route.params.id)
})

const isHelper = computed(() => {
  return profile.value?.roles?.includes('HELPER')
})

const shownProfile = computed(() => {
  return profileStore.teammates().find((a) => a.id == id.value)
})

const isPendingInvite = computed(() => {
  return shownProfile.value?.isEmailPending && shownProfile.value?.isPhonePending
})

const isShowingPatient = computed(() => {
  return shownProfile.value?.roles?.includes('CLIENT') || false
})

const profile = computed(() => {
  return profileStore.profile
})

const roles = computed(() => {
  return shownProfile.value?.roles
})

const helperRemoved = async () => {
  router.push({ name: 'helpers' })
}

const resendInvite = async () => {
  try {
    if (shownProfile.value) {
      await profileStore.resendInvite(shownProfile.value)
      addToast({ text: t('Invitation sent successfully'), variant: 'success' })
    }
  } catch (error: any) {
    console.error(error)
    addToast({ text: t('Failed to send invitation'), variant: 'error' })
  }
}

onMounted(async () => {
  profileStore.fetchTeammates(profile.value?.teamId as number)
  enumStore.fetchStepTypes()

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0">
    <template #title>
      <v-row>
        <v-col cols="8">
          <v-btn icon color="primary" variant="text" :to="{ name: 'contacts' }"><i-mdi-chevron-left /></v-btn>
          <i-mdi-account-group class="mr-2" />
          {{ shownProfile?.firstName || '-' }} {{ shownProfile?.lastName || '-' }}
        </v-col>

        <v-col v-if="!isHelper" cols="4" class="text-right">
          <v-btn v-if="isPendingInvite" class="ml-2" color="primary" @click="resendInvite"
            ><i-mdi-email class="mr-2" />{{ $t('Resend Invite') }}</v-btn
          >

          <v-btn variant="text" class="mt-4" color="primary" @click="showEditDialog = true">
            <i-mdi-pencil class="mr-1" />
            {{ $t('Edit') }}
          </v-btn>

          <v-dialog v-model="showEditDialog" :fullscreen="isMobile" width="800" persistent>
            <HelperEdit :id="id" @cancel="showEditDialog = false" />
          </v-dialog>
        </v-col>
      </v-row>
    </template>
    <v-divider></v-divider>

    <v-card-text class="text-center">
      <ProfileImageUpload :profile="shownProfile" :enable-edit="false" />
    </v-card-text>
    <v-divider />

    <v-card-text class="pb-16 pl-12 pr-12 pt-0">
      <v-list>
        <v-list-item
          v-if="
            (!shownProfile?.isEmailPending || !shownProfile?.isPhonePending) &&
            !isShowingPatient &&
            (!shownProfile?.relationshipAttributes?.responseTypes ||
              shownProfile?.relationshipAttributes?.responseTypes?.length === 0)
          "
        >
          <v-chip class="text-warning">
            <v-icon class="mr-1" left color="warning">mdi-alert</v-icon> {{ $t('Pending service requests') }}
          </v-chip>
        </v-list-item>

        <v-list-subheader>{{ $t('Basic Information') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col>
              <Attribute :title="$t('First Name')" :value="shownProfile?.firstName" />
              <Attribute :title="$t('Last Name')" :value="shownProfile?.lastName" />
              <Attribute :title="$t('Email')" :value="shownProfile?.email" />
              <Attribute :title="$t('Phone')" :value="shownProfile?.phoneNumber" />
            </v-col>
          </v-row>
        </v-list-item>

        <span v-if="!isShowingPatient" class="my-6">
          <v-list-subheader>{{ $t('Services Requested') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <v-row>
              <v-col cols="10">
                <span v-if="shownProfile?.relationshipAttributes?.requestTypes">
                  <v-chip
                    v-for="requestType in shownProfile?.relationshipAttributes?.requestTypes"
                    :key="requestType"
                    class="mr-2"
                  >
                    <i-mdi-car-back v-if="requestType == 'TRANSPORTATION'" class="mr-1" />
                    <i-mdi-food v-if="requestType == 'MEAL'" class="mr-1" />
                    <i-mdi-human-male-child v-if="requestType == 'CHILD_CARE'" class="mr-1" />
                    {{ $t(requestType) }}
                  </v-chip>
                </span>
                <span v-else class="text-center text-grey">({{ t('None') }})</span>
              </v-col>
            </v-row>
          </v-list-item>
        </span>

        <span v-if="!isShowingPatient" class="my-6">
          <v-list-subheader>{{ $t('Services Accepted') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <v-row>
              <v-col cols="10">
                <span v-if="shownProfile?.relationshipAttributes?.responseTypes">
                  <v-chip
                    v-for="responseType in shownProfile?.relationshipAttributes?.responseTypes"
                    :key="responseType"
                    class="mr-2"
                  >
                    <i-mdi-car-back v-if="responseType == 'TRANSPORTATION'" class="mr-1" />
                    <i-mdi-food v-if="responseType == 'MEAL'" class="mr-1" />
                    <i-mdi-human-male-child v-if="responseType == 'CHILD_CARE'" class="mr-1" />
                    {{ $t(responseType) }}
                  </v-chip>
                </span>
                <span v-else class="text-center text-grey">({{ t('None') }})</span>
              </v-col>
            </v-row>
          </v-list-item>
        </span>

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

        <!-- Danger Zone -->
        <template v-if="!isShowingPatient">
          <v-list-subheader class="text-error">{{ $t('Danger Zone') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <HelperRemove @remove="helperRemoved" />
          </v-list-item>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>
