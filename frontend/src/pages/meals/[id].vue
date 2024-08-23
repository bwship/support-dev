<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeal } from '@/stores/meal'

const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600
const route = useRoute()
const mealStore = useMeal()
const showEditDialog = ref(false)
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})

const company = computed(() => {
  return meal.value?.profile
})

const id = computed(() => {
  return Number(props.id || route.params.id)
})

const meal = computed(() => {
  return meals.value.find((a) => a.id == id.value)
})

const meals = computed(() => {
  return mealStore.meals
})

const mealRemoved = async () => {
  router.push({ name: 'meals' })
}

onMounted(async () => {
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
          <v-btn icon color="primary" variant="text" :to="{ name: 'meals' }"><i-mdi-chevron-left /></v-btn>
          <i-mdi-silverware class="mr-2 mt-4" />
          {{ company.firstName }}
        </v-col>

        <v-col cols="4" class="text-right">
          <v-btn variant="text" class="mt-4" color="primary" @click="showEditDialog = true">
            <i-mdi-pencil class="mr-1" />
            {{ $t('Edit') }}
          </v-btn>

          <v-dialog v-model="showEditDialog" :fullscreen="isMobile" width="800" persistent>
            <MealLocatorEdit :id="id" @cancel="showEditDialog = false" />
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
              <Attribute :title="$t('Days of Operation')" :value="meal?.workingDays" />
              <Attribute :title="$t('Hours of Operation')" :value="meal?.workingHours" />
              <Attribute :title="$t('Meal Type')" :value="meal?.mealType" />
              <Attribute :title="$t('Meal Delivery Method')" :value="meal?.mealDeliveryMethod" />
            </v-col>
          </v-row>
        </v-list-item>

        <v-list-subheader class="headline">{{ $t('Company Information') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col>
              <Attribute :title="$t('Name')" :value="company.firstName" />
              <Attribute :title="$t('Website')" :value="company.attributes?.website" />
            </v-col>
          </v-row>
        </v-list-item>

        <v-list-subheader class="headline">{{ $t('Eligibility') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col>
              <Attribute :title="$t('Requires Eligibility')" :value="meal?.requiresEligibility" />
              <Attribute :title="$t('Eligibility Rules')" :value="meal?.eligibilityRules" />
            </v-col>
          </v-row>
        </v-list-item>

        <v-list-subheader>{{ $t('Location') }}</v-list-subheader>
        <v-divider />

        <AddressListItem v-if="meal.address" :address="meal.address"></AddressListItem>

        <v-list-item v-if="meal.address">
          <Map :address="meal.address"></Map>
        </v-list-item>

        <v-list-subheader class="text-error">{{ $t('Danger Zone') }}</v-list-subheader>
        <v-divider />

        <v-list-item><MealLocatorRemove @remove="mealRemoved" /></v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
