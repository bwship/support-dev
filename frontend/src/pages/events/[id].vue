<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAddress } from '@/stores/address'
import { useProfile } from '@/stores/profile'
import { useRoute } from 'vue-router'
import { useStep } from '@/stores/step'

const addressStore = useAddress()
const isLoading = ref(false)
const profileStore = useProfile()
const route = useRoute()
const stepStore = useStep()

const stepId = computed(() => {
  return Number(route.params.id)
})

const step = computed(() => {
  return stepStore.steps?.find((s) => s.id == stepId.value)
})

const profile = computed(() => {
  return profileStore.profile
})

const teamId = computed(() => {
  return profile.value?.teamId
})

onMounted(async () => {
  if (teamId.value) {
    isLoading.value = true

    await Promise.all([
      profileStore.fetchTeammates(teamId.value as number),
      addressStore.fetchAddresses(teamId.value as number),
      stepStore.fetchSteps(teamId.value as number),
    ])

    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="step && !isLoading">
    <ChildCareDetail v-if="step.type == 'CHILD_CARE'" :step-id="step.id" />
    <TransportationDetail v-else-if="step.type == 'TRANSPORTATION'" :step-id="step.id" />
    <MealDetail v-else-if="step.type == 'MEAL'" :step-id="step.id" />
  </div>
  <template v-else>
    <v-list-item class="pa-16">
      <v-skeleton-loader type="card"></v-skeleton-loader>
    </v-list-item>
  </template>
</template>
