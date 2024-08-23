<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const showAddMenu = ref(false)
const showAddChildCareDialog = ref(false)
const showAddMealDialog = ref(false)
const showAddTransportationDialog = ref(false)

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
  <!-- Add Button -->
  <v-menu v-model="showAddMenu">
    <template #activator="{ props }">
      <v-btn color="primary" v-bind="props">
        <i-mdi-plus />
        {{ $t('Add') }}
        <i-mdi-chevron-down v-if="!showAddMenu"></i-mdi-chevron-down>
        <i-mdi-chevron-up v-else></i-mdi-chevron-up>
      </v-btn>
    </template>

    <v-list class="bordered-list">
      <v-list-item @click="showAddChildCareDialog = true">
        <template #prepend>
          <i-mdi-human-male-boy />
        </template>

        <v-list-item-title class="pl-2">{{ $t('Child Care') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="showAddMealDialog = true">
        <template #prepend>
          <i-mdi-silverware />
        </template>

        <v-list-item-title class="pl-2">{{ $t('Meals') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="showAddTransportationDialog = true">
        <template #prepend>
          <i-mdi-car />
        </template>

        <v-list-item-title class="pl-2"> {{ $t('Transportation') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- Add Child care Dialog -->
  <v-dialog v-model="showAddChildCareDialog" :fullscreen="isMobile" width="800" persistent>
    <ChildCareEdit :cancel-button="true" @close="showAddChildCareDialog = false" />
  </v-dialog>

  <!-- Add Meal Dialog -->
  <v-dialog v-model="showAddMealDialog" :fullscreen="isMobile" width="800" persistent>
    <MealEdit :cancel-button="true" @close="showAddMealDialog = false" />
  </v-dialog>

  <!-- Add Transportation Dialog -->
  <v-dialog v-model="showAddTransportationDialog" :fullscreen="isMobile" width="800" persistent>
    <TransportationEdit :cancel-button="true" @close="showAddTransportationDialog = false" />
  </v-dialog>
</template>
