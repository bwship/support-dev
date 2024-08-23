<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { Profile, RoleType } from '@/models'
import useToasts from '@/composables/useToasts'
import { useEnum } from '@/stores/enum'
import { capitalizeWords } from '@/utils/nameUtils'
import { emailRules } from '@/utils/emailUtils'

const props = defineProps<{
  id?: number
}>()

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'update', id?: number): void
}>()

const { addToast } = useToasts()

const profileStore = useProfile()
const enumStore = useEnum()
const isSaving = ref(false)
const { t } = useI18n()

const addAnother = ref(false)
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600
const firstName = ref('')
const formRef = ref<any>(null)
const lastName = ref('')
const email = ref('')
const isAdministrator = ref(false)
const selectedRequestTypes = ref<any[]>([])
const showStepTypeValidationMessage = ref(false)

const buttonTitle = computed(() => {
  return isAdd.value ? 'Invite' : 'Save'
})

const isAdd = computed(() => {
  return props.id == null
})

const icon = computed(() => {
  return isAdd.value ? 'mdi-email' : 'mdi-content-save'
})

const helper = computed(() => {
  return profileStore.teammates().find((a) => a.id == props.id)
})

const isPending = computed(() => {
  if (helper.value) {
    return (
      !helper.value.relationshipAttributes?.responseTypes ||
      helper.value.relationshipAttributes?.responseTypes?.length === 0
    )
  }
  return true
})

const profile = computed(() => {
  return profileStore.profile
})

const stepTypes = computed(() => {
  return enumStore.stepTypes.map((item) => item.id)
})

const title = computed(() => {
  return props.id ? t('Edit Helper') : t('Invite Helper')
})

const cancelClicked = async () => {
  emit('cancel', props.id)
}

const validated = computed(() => {
  if (isSaving.value) return false
  if (firstName.value == '') return false
  if (lastName.value == '') return false
  if (selectedRequestTypes.value.length == 0) return false
  for (const rule of emailRules) {
    const result = rule(email.value)
    if (result !== true) {
      return false
    }
  }
  return true
})

const saveClicked = async () => {
  try {
    isSaving.value = true

    showStepTypeValidationMessage.value = !stepTypeValidationMessage.value

    const profileId = profile.value?.id
    const isAdmin = isAdministrator.value

    let roles: RoleType[] = ['HELPER'] // Default roles

    if (isAdmin) {
      roles.push('TEAM_ADMIN') // Add TEAM_ADMIN role if user is administrator
    }

    const helperEdit: Profile = {
      id: props.id,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      relationshipAttributes: { requestTypes: selectedRequestTypes.value },
      attributes: {},
      roles,
      parentProfileId: profileId as number,
      teamId: profile.value?.teamId,
      userId: helper.value?.userId,
    }

    // if edit, then upsert, else invite
    if (props.id) {
      await profileStore.upsert(helperEdit)
    } else {
      await profileStore.inviteHelper(helperEdit)
    }

    await profileStore.fetchTeammates(profile.value?.teamId as number)

    if (props.id) {
      addToast({ text: t('Helper updated successfully'), variant: 'success' })
    } else {
      addToast({ text: t('Helper added successfully'), variant: 'success' })
    }

    if (addAnother.value) {
      firstName.value = ''
      lastName.value = ''
      email.value = ''
      selectedRequestTypes.value = []
      formRef.value.resetValidation()
      showStepTypeValidationMessage.value = false
    } else {
      cancelClicked()
    }
  } catch (error: any) {
    console.error('Error creating helper:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

watch(firstName, (newValue) => {
  const capitalized = capitalizeWords(newValue)
  if (capitalized !== newValue) {
    firstName.value = capitalizeWords(newValue)
  }
})

watch(lastName, (newValue) => {
  const capitalized = capitalizeWords(newValue)
  if (capitalized !== newValue) {
    lastName.value = capitalizeWords(newValue)
  }
})

watch(helper, (newHelper) => {
  if (newHelper) {
    firstName.value = newHelper.firstName
    lastName.value = newHelper.lastName || ''
    email.value = newHelper.email || ''
    isAdministrator.value = newHelper.roles.includes('TEAM_ADMIN')
  }
})

const stepTypeValidationMessage = computed(() => {
  return selectedRequestTypes.value.length > 0 ? '' : 'Select at least one'
})

onMounted(async () => {
  profileStore.fetchTeammates(profile.value?.teamId as number)
  enumStore.fetchStepTypes()
  selectedRequestTypes.value = helper.value?.relationshipAttributes?.requestTypes || []

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <v-btn color="primary" variant="text" text :disabled="isSaving" @click="cancelClicked">Cancel</v-btn>

      <span class="text-center">{{ title }}</span>

      <v-btn
        color="primary"
        :disabled="isSaving || !validated"
        :loading="isSaving"
        variant="elevated"
        @click="saveClicked"
      >
        <v-icon class="mr-2">{{ icon }}</v-icon> {{ $t(buttonTitle) }}</v-btn
      >
    </v-card-title>
    <v-divider />

    <v-card-text class="mb-4">
      <v-form ref="formRef">
        <h5>{{ $t('Basic Information') }}</h5>
        <v-divider />

        <v-row>
          <v-col :size="isMobile ? 12 : 6">
            <v-text-field
              v-model="firstName"
              :label="$t('First Name')"
              :rules="[(v:any) => !!v || 'First Name is required']"
              :disabled="!isPending"
              required
            ></v-text-field>
          </v-col>

          <v-col :size="isMobile ? 12 : 6">
            <v-text-field
              v-model="lastName"
              :label="$t('Last Name')"
              :rules="[(v:any) => !!v || 'Last Name is required']"
              :disabled="!isPending"
              required
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col :size="isMobile ? 12 : 6">
            <v-text-field
              v-model="email"
              :disabled="!isPending"
              :label="$t('E-mail')"
              :rules="emailRules"
              required
            ></v-text-field>
          </v-col>

          <v-col :size="isMobile ? 12 : 6">
            <v-checkbox v-model="isAdministrator" :label="$t('Administrator')"></v-checkbox>
          </v-col>
        </v-row>

        <h5>{{ $t('Select Services') }}</h5>
        <v-divider />

        <div v-if="showStepTypeValidationMessage" class="text-error">{{ stepTypeValidationMessage }}</div>
        <div v-else class="step-type-message"><br /></div>
        <v-row class="ml-4 pl-4">
          <v-switch
            v-for="stepType in stepTypes"
            :key="stepType"
            v-model="selectedRequestTypes"
            class="pl-8"
            color="primary"
            :label="t(stepType)"
            :value="stepType"
            hide-details
          ></v-switch>
        </v-row>
      </v-form>
    </v-card-text>
    <v-divider v-if="isAdd" />

    <v-card-actions v-if="isAdd" class="pa-0 pl-4">
      <v-checkbox v-model="addAnother" :label="$t('Invite Another')"></v-checkbox>
    </v-card-actions>
  </v-card>
</template>
