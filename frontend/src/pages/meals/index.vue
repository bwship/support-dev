<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMeal } from '@/stores/meal'

const { t } = useI18n()
const days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const mealStore = useMeal()
const selectedDays = ref(['Monday', 'Tuesday'])
const showAddDialog = ref(false)

const addresses = [
  {
    id: 1,
    name: 'Friday Cafe',
    address: '123 Main St',
    city: 'Boston',
    state: 'MA',
    zip: '02108',
    latitude: 42.3601,
    longitude: -71.0589,
    location: {
      lat: 42.3601,
      lng: -71.0589,
    },
  },
  {
    id: 2,
    name: 'Harvard Square Churches Meal Program',
    address: '456 Elm St',
    city: 'Boston',
    state: 'MA',
    zip: '02108',
    latitude: 42.3601,
    longitude: -71.0589,
    location: {
      lat: 42.3601,
      lng: -71.0589,
    },
  },
  {
    id: 3,
    name: 'Bread of Life',
    address: '1 John Street',
    city: 'Boston',
    state: 'MA',
    zip: '02108',
    latitude: 42.3601,
    longitude: -71.0589,
    location: {
      lat: 42.3601,
      lng: -71.0589,
    },
  },
  {
    id: 3,
    name: 'East End House',
    address: '12 Leo Drive',
    city: 'Boston',
    state: 'MA',
    zip: '02108',
    latitude: 42.3601,
    longitude: -71.0589,
    location: {
      lat: 42.3601,
      lng: -71.0589,
    },
  },
]

const meals = computed(() => {
  return mealStore.meals
})

onMounted(async () => {
  mealStore.fetchMeals()

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0" prepend-icon="mdi-silverware">
    <template #title>
      <v-row>
        <v-col cols="9" class="pt-6">
          {{ $t('Meal Locator') }}
        </v-col>

        <v-col :cols="isMobile ? 'auto' : '3'" class="mt-2 text-right">
          <v-btn color="primary" @click="showAddDialog = true">
            <i-mdi-plus />
            {{ $t('Add Meal') }}
          </v-btn>

          <v-dialog v-model="showAddDialog" :fullscreen="isMobile" width="800" persistent>
            <MealLocatorEdit @cancel="showAddDialog = false" />
          </v-dialog>
        </v-col>
      </v-row>
    </template>
    <v-divider />

    <v-row class="pt-3 pl-3">
      <v-col cols="4">
        <v-select
          v-model="selectedDays"
          density="compact"
          variant="outlined"
          multiple
          :items="days"
          dense
          outlined
          chips
          :label="t('Days')"
        >
        </v-select>
      </v-col>
    </v-row>

    <v-divider />

    <v-row>
      <v-col cols="12">
        <v-list>
          <v-list-subheader>{{ $t('Locations') }}</v-list-subheader>

          <template v-for="meal in meals" :key="meal.id">
            <MealLocatorListItem :meal="meal" />
          </template>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
</template>
