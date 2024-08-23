<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { Profile } from '@/models'
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

const profileStore = useProfile()
const enumStore = useEnum()
const isSaving = ref(false)
const { t } = useI18n()

const firstName = ref('')
const lastName = ref('')
const familyMemberType = ref('')
const foodAllergyDescription = ref('')
const foodPreferencesDescription = ref('')
const disabilityAccommodationsDescription = ref('')

const dependent = computed(() => {
  return dependents.value.find((a) => a.id == props.id)
})

const dependents = computed(() => {
  if (profile.value && profile.value.teamId) {
    return profileStore.dependents()
  }
  return []
})

const profile = computed(() => {
  return profileStore.profile
})

const familyMemberTypes = computed(() => {
  return enumStore.familyMemberTypes
})

const title = computed(() => {
  return props.id ? t('Edit Dependent') : t('Add Dependent')
})

const cancelClicked = async () => {
  emit('cancel', props.id)
}

const saveClicked = async () => {
  try {
    isSaving.value = true

    const profileId = profile.value?.id

    const dependent: Profile = {
      id: props.id,
      firstName: firstName.value,
      lastName: lastName.value,
      relationshipAttributes: {
        familyMemberType: familyMemberType.value,
      },
      attributes: {
        foodAllergyDescription: foodAllergyDescription.value,
        disabilityAccommodationsDescription: disabilityAccommodationsDescription.value,
        foodPreferencesDescription: foodPreferencesDescription.value,
      },
      roles: ['FAMILY_MEMBER'],
      parentProfileId: profileId as number,
      teamId: profile.value?.teamId,
    }

    await profileStore.upsert(dependent)

    if (props.id) {
      addToast({ text: t('Dependent updated successfully'), variant: 'success' })
    } else {
      addToast({ text: t('Dependent added successfully'), variant: 'success' })
    }

    cancelClicked()
  } catch (error: any) {
    console.error('Error creating dependent:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

watch(dependent, (newDependent) => {
  if (newDependent) {
    firstName.value = newDependent.firstName
    lastName.value = newDependent.lastName
    familyMemberType.value = newDependent.relationshipAttributes?.familyMemberType || ''
    foodAllergyDescription.value = newDependent.attributes.foodAllergyDescription || ''
    disabilityAccommodationsDescription.value = newDependent.attributes.disabilityAccommodationsDescription || ''
    foodPreferencesDescription.value = newDependent.attributes.foodPreferencesDescription || ''
  }
})

onMounted(async () => {
  profileStore.fetchTeammates(profile.value?.teamId as number)
  enumStore.fetchFamilyMemberTypes()
})
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <v-btn color="primary" variant="text" text :disabled="isSaving" @click="cancelClicked">Cancel</v-btn>

      <span class="text-center">{{ title }}</span>

      <v-btn color="primary" :disabled="isSaving" :loading="isSaving" variant="elevated" @click="saveClicked"
        ><i-mdi-content-save /> {{ $t('Save') }}</v-btn
      >
    </v-card-title>
    <v-divider />

    <v-card-text>
      <v-form>
        <h5>{{ $t('Basic Information') }}</h5>
        <v-divider />

        <v-row>
          <v-col size="6">
            <v-text-field v-model="firstName" :label="$t('First Name')"></v-text-field>
          </v-col>
          <v-col size="6">
            <v-text-field v-model="lastName" :label="$t('Last Name')"></v-text-field>
          </v-col>
        </v-row>

        <v-select
          v-model="familyMemberType"
          item-title="id"
          :items="familyMemberTypes"
          :label="$t('Relationship')"
        ></v-select>

        <h5>{{ $t('Food Allergies') }}</h5>
        <v-divider />
        <v-textarea v-model="foodAllergyDescription"></v-textarea>

        <h5>{{ $t('Food Preferences') }}</h5>
        <v-divider />

        <v-textarea v-model="foodPreferencesDescription"></v-textarea>

        <h5>{{ $t('Disability & Accommodations') }}</h5>
        <v-divider />

        <v-textarea v-model="disabilityAccommodationsDescription"></v-textarea>
      </v-form>
    </v-card-text>
  </v-card>
</template>
