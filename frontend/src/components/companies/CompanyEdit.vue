<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { Profile } from '@/models'
import useToasts from '@/composables/useToasts'

const props = defineProps<{
  id?: number
}>()

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'update', id?: number): void
}>()

const { addToast } = useToasts()

const profileStore = useProfile()
const isSaving = ref(false)
const { t } = useI18n()

const firstName = ref('')
const website = ref('')

const company = computed(() => {
  return companies.value.find((a) => a.id == props.id)
})

const companies = computed(() => {
  return profileStore.companies
})

const title = computed(() => {
  return props.id ? t('Edit Company') : t('Add Company')
})

const cancelClicked = async () => {
  emit('cancel', props.id)
}

const saveClicked = async () => {
  try {
    isSaving.value = true

    const company: Profile = {
      id: props.id,
      firstName: firstName.value,
      attributes: {
        website: website.value,
      },
      roles: ['COMPANY'],
    }

    await profileStore.upsert(company)
    await profileStore.fetchCompanies(false)

    props.id
      ? addToast({ text: t('Company updated successfully'), variant: 'success' })
      : addToast({ text: t('Company added successfully'), variant: 'success' })

    cancelClicked()
  } catch (error: any) {
    console.error('Error creating company:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

watch(company, (newCompany) => {
  if (newCompany) {
    firstName.value = newCompany.firstName
    website.value = newCompany.attributes.website || ''
  }
})

onMounted(async () => {
  profileStore.fetchCompanies()
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
            <v-text-field v-model="firstName" :label="$t('Name')"></v-text-field>
          </v-col>
          <v-col size="6">
            <v-text-field v-model="website" :label="$t('Website')"></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>
