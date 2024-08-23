<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Meal } from '@/models/Meal'
import { useAddress } from '@/stores/address'
import { useProfile } from '@/stores/profile'

const addressStore = useAddress()
const profileStore = useProfile()

const props = defineProps<{
  meal: Meal
}>()

const company = computed(() => {
  return meal.value.profile
})

const meal = computed(() => {
  return props.meal
})

onMounted(async () => {})
</script>

<template>
  <v-list-item :to="{ name: 'meals-id', params: { id: meal.id } }">
    <v-list-item-title>
      {{ company.firstName }}
    </v-list-item-title>

    <v-list-item-subtitle class="mt-2 mb-3"> {{ meal.workingDays }} {{ meal.workingHours }} </v-list-item-subtitle>

    <v-list-item-subtitle class="pt-2">
      <v-chip v-for="(type, index) in meal.mealType" :key="index" color="secondary" class="mr-2">
        {{ type }}
      </v-chip>

      <v-chip v-for="(method, index) in meal.mealDeliveryMethod" :key="index" color="secondary" class="mr-2">
        {{ method }}
      </v-chip>
    </v-list-item-subtitle>

    <template #append>
      <v-btn class="chevron-right-padding" color="grey" variant="text" size="large">
        <i-mdi-chevron-right />
      </v-btn>
    </template>

    <v-divider />
  </v-list-item>
</template>
