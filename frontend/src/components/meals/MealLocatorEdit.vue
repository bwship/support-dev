<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { convertAddressToText } from '@/utils/addressUtils'
import { useEnum } from '@/stores/enum'
import { useI18n } from 'vue-i18n'
import { useAddress } from '@/stores/address'
import { useMeal } from '@/stores/meal'
import { useProfile } from '@/stores/profile'
import { Meal } from '@/models'
import useToasts from '@/composables/useToasts'

const props = defineProps<{
  id?: number
}>()

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'update', id?: number): void
}>()

const { addToast } = useToasts()

const addressStore = useAddress()
const enumStore = useEnum()
const mealStore = useMeal()
const profileStore = useProfile()
const isSaving = ref(false)
const showAddAddressDialog = ref(false)
const showAddCompanyDialog = ref(false)
const { t } = useI18n()

const addressId = ref<number | null>(null)
const companyId = ref<number | null>(null)
const description = ref('')
const eligibilityRules = ref('')
const mealType = ref<string[]>([])
const mealDeliveryMethod = ref<string[]>([])
const requiresEligibility = ref(false)
const workingDays = ref('')
const workingHours = ref('')

const address = computed(() => {
  return addresses.value.find((a) => a.id == addressId.value)
})

const addresses = computed(() => {
  return addressStore.addressesByCommpany.map((address) => {
    return {
      ...address,
      text: convertAddressToText(address, t(address.type) + ' - '),
    }
  })
})

const company = computed(() => {
  return companies.value.find((a) => a.id == companyId.value)
})

const companies = computed(() => {
  return profileStore.companies
})

const meal = computed(() => {
  return meals.value.find((a) => a.id == props.id)
})

const meals = computed(() => {
  return mealStore.meals
})

const mealTypes = computed(() => {
  return enumStore.mealTypes
})

const mealDeliveryMethods = computed(() => {
  return enumStore.mealDeliveryMethods
})

const title = computed(() => {
  return props.id ? t('Edit Meal') : t('Add Meal')
})

const cancelClicked = async () => {
  emit('cancel', props.id)
}

const saveClicked = async () => {
  try {
    isSaving.value = true

    const meal: Meal = {
      id: props.id,

      firstName: firstName.value,
      attributes: {
        data: {},
      },
    }

    await profileStore.upsert(company)
    await profileStore.fetchCompanies(false)

    props.id
      ? addToast({ text: t('Meal updated successfully'), variant: 'success' })
      : addToast({ text: t('Meal added successfully'), variant: 'success' })

    cancelClicked()
  } catch (error: any) {
    console.error('Error creating meal:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

watch(company, (newCompany) => {
  if (newCompany) {
    addressStore.fetchAddressesByCompany(newCompany.id as number)
  }
})

watch(meal, (newMeal) => {
  if (newMeal) {
    description.value = newMeal.description || ''
    eligibilityRules.value = newMeal.eligibilityRules || ''
    requiresEligibility.value = newMeal.requiresEligibility || false

    workingDays.value = newMeal.workingDays || ''
    workingHours.value = newMeal.workingHours || ''
  }
})

onMounted(async () => {
  profileStore.fetchCompanies()
  mealStore.fetchMeals()
  enumStore.fetchMealTypes()
  enumStore.fetchMealDeliveryMethods()
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
            <v-text-field v-model="workingDays" :label="$t('Days of Operation')"></v-text-field>
          </v-col>
          <v-col size="6">
            <v-text-field v-model="workingHours" :label="$t('Hours of Operation')"></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col size="6">
            <v-select
              v-model="mealType"
              :label="$t('Meal Types')"
              :items="mealTypes"
              item-title="id"
              item-value="id"
              chips
              multiple
              variant="outlined"
            ></v-select>
          </v-col>

          <v-col size="6">
            <v-select
              v-model="mealDeliveryMethod"
              :label="$t('Delivery Methods')"
              :items="mealDeliveryMethods"
              item-title="id"
              item-value="id"
              chips
              multiple
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col size="6">
            <h5>
              <v-row>
                <v-col cols="8" class="text-left">
                  {{ $t('Company') }}
                </v-col>
                <v-col cols="4" class="text-right">
                  <v-btn variant="text" size="small" color="primary" @click="showAddCompanyDialog = true">
                    <i-mdi-plus class="mr-2" />
                    {{ $t('Add New') }}
                  </v-btn>
                </v-col>
              </v-row>
            </h5>
            <v-divider />

            <v-select
              v-model="companyId"
              :label="$t('Company')"
              :items="companies"
              item-title="firstName"
              item-value="id"
              clearable
              variant="outlined"
            ></v-select>
          </v-col>

          <v-col size="6">
            <h5>
              <v-row>
                <v-col cols="8" class="text-left">
                  {{ $t('Address') }}
                </v-col>
                <v-col cols="4" class="text-right">
                  <v-btn
                    :disabled="!companyId"
                    variant="text"
                    size="small"
                    color="primary"
                    @click="showAddAddressDialog = true"
                  >
                    <i-mdi-plus class="mr-2" />
                    {{ $t('Add New') }}
                  </v-btn>
                </v-col>
              </v-row>
            </h5>
            <v-divider />

            <v-select
              v-model="addressId"
              :disabled="!companyId"
              :label="$t('Address')"
              :items="addresses"
              item-title="text"
              item-value="id"
              clearable
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>

        <h5>{{ $t('Eligibility') }}</h5>
        <v-divider />

        <v-row>
          <v-col cols="12">
            <v-switch
              v-model="requiresEligibility"
              :label="t('Requires Eligibility')"
              color="primary"
              hide-details
            ></v-switch>
          </v-col>
        </v-row>

        <v-row v-if="requiresEligibility">
          <v-col cols="12">
            <v-text-field v-model="eligibilityRules" :label="$t('Eligibility Rules')"></v-text-field>
          </v-col>
        </v-row>

        <h5>{{ $t('Description') }}</h5>
        <v-divider />

        <v-textarea v-model="description"></v-textarea>

        <v-dialog v-model="showAddCompanyDialog" :fullscreen="isMobile" width="800" persistent>
          <CompanyEdit @cancel="showAddCompanyDialog = false" />
        </v-dialog>

        <v-dialog v-model="showAddAddressDialog" :fullscreen="isMobile" width="800" persistent>
          <AddressEdit @cancel="showAddAddressDialog = false" />
        </v-dialog>
      </v-form>
    </v-card-text>
  </v-card>
</template>
