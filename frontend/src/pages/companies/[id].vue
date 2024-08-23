<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAddress } from '@/stores/address'
import { useMeal } from '@/stores/meal'
import { useProfile } from '@/stores/profile'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})
const id = computed(() => {
  return Number(props.id || route.params.id)
})

const addressStore = useAddress()
const mealStore = useMeal()
const profileStore = useProfile()
const showEditDialog = ref(false)
const showAddAddressDialog = ref(false)
const showAddMealDialog = ref(false)

const addresses = computed(() => {
  return addressStore.addressesByCommpany
})

const companyId = computed(() => {
  return props.id
})

const company = computed(() => {
  return companies.value.find((a) => a.id == id.value)
})

const companies = computed(() => {
  return profileStore.companies
})

const meals = computed(() => {
  return mealStore.meals.filter((a) => a.profileId == id.value)
})

const profile = computed(() => {
  return profileStore.profile
})

const isDeleteOrEditEnabled = computed(() => {
  const profileRoles = profile?.value?.roles || []

  return profileRoles.some((role) => ['ADMIN'].includes(role))
})

const companyRemoved = async () => {
  router.push({ name: 'companies' })
}

onMounted(async () => {
  addressStore.fetchAddressesByCompany(id.value)
  mealStore.fetchMeals()
  profileStore.fetchCompanies()
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0">
    <template #title>
      <v-row>
        <v-col cols="9">
          <v-btn icon color="primary" variant="text" :to="{ name: 'companies' }"><i-mdi-chevron-left /></v-btn>
          <i-mdi-domain class="mr-2 mt-4" />
          {{ company?.firstName }}
          <v-card-subtitle class="pl-12">
            {{ $t('Company') }}
          </v-card-subtitle>
        </v-col>

        <v-col cols="3" class="text-right">
          <v-btn
            v-if="isDeleteOrEditEnabled"
            class="mt-3"
            variant="text"
            color="primary"
            @click="showEditDialog = true"
          >
            <i-mdi-pencil class="mr-1" />
            {{ $t('Edit') }}
          </v-btn>

          <v-dialog v-model="showEditDialog" width="800" persistent>
            <CompanyEdit :id="id" @cancel="showEditDialog = false" />
          </v-dialog>
        </v-col>
      </v-row>
    </template>
    <v-divider />

    <v-card-text class="pb-16 pl-12 pr-12 pt-0">
      <v-list>
        <v-list-subheader class="headline">{{ $t('Basic Information') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col>
              <Attribute :title="$t('Name')" :value="company?.firstName" />
              <Attribute :title="$t('Website')" :value="company?.attributes?.website" />
            </v-col>
          </v-row>
        </v-list-item>

        <v-list-subheader>
          {{ $t('Addresses') }}

          <v-btn variant="text" size="small" color="primary" @click="showAddAddressDialog = true">
            <i-mdi-plus />
          </v-btn>

          <v-dialog v-model="showAddAddressDialog" :fullscreen="isMobile" width="800" persistent>
            <AddressEdit :company-id="companyId" @cancel="showAddAddressDialog = false" />
          </v-dialog>
        </v-list-subheader>
        <v-divider />

        <span v-if="!addresses.length">
          <v-list-item class="text-grey text-center">
            <p>({{ $t('None') }})</p>
          </v-list-item>
        </span>
        <span v-else>
          <AddressListItem v-for="address in addresses" :key="address.id" :address="address"></AddressListItem>
        </span>

        <v-list-subheader class="headline">
          {{ $t('Meal Locations') }}

          <v-btn variant="text" size="small" color="primary" @click="showAddMealDialog = true">
            <i-mdi-plus />
          </v-btn>

          <v-dialog v-model="showAddMealDialog" :fullscreen="isMobile" width="800" persistent>
            <MealLocatorEdit :company-id="companyId" @cancel="showAddMealDialog = false" />
          </v-dialog>
        </v-list-subheader>
        <v-divider />

        <span v-if="!meals.length">
          <v-list-item class="text-grey text-center">
            <p>({{ $t('None') }})</p>
          </v-list-item>
        </span>
        <span v-else>
          <MealLocatorListItem v-for="meal in meals" :key="meal.id" :meal="meal"></MealLocatorListItem>
        </span>

        <!-- Danger Zone -->
        <span v-if="isDeleteOrEditEnabled">
          <v-list-subheader class="text-error">{{ $t('Danger Zone') }}</v-list-subheader>
          <v-divider />

          <v-list-item><AddressRemove @remove="companyRemoved" /></v-list-item>
        </span>
      </v-list>
    </v-card-text>
  </v-card>
</template>
