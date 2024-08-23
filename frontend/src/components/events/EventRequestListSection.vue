<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStep } from '@/stores/step'
import { useProfile } from '@/stores/profile'

const stepStore = useStep()
const profileStore = useProfile()

const props = defineProps({
  stepId: { type: Number, default: null },
})

const isOverTwoWeeks = computed(() => {
  const stepValue = step.value
  if (!stepValue || !stepValue.startDate) return false // Handle edge cases where step or startDate is undefined

  const startDate = new Date(stepValue.startDate)
  const twoWeeksFromNow = new Date()
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14) // Calculate date two weeks from now

  return startDate.getTime() > twoWeeksFromNow.getTime()
})

const profile = computed(() => {
  return profileStore.profile
})

const requests = computed(() => {
  return step.value?.requests
    ?.filter((r: { status: string }) => ['ACCEPTED', 'INVITED'].includes(r.status))
    .sort((a, b) => {
      // If a's ranking is undefined or null, set it to 0
      const rankingA = a.ranking || 100
      // If b's ranking is undefined or null, set it to 0
      const rankingB = b.ranking || 100
      // Compare the rankings
      return rankingA - rankingB
    })
})

const step = computed(() => {
  return stepStore.steps?.find((s: { id: number }) => s.id == props.stepId)
})

const teamId = computed(() => {
  return profile.value?.teamId
})

onMounted(async () => {
  if (teamId.value) {
    profileStore.fetchTeammates(teamId.value)
  }
})
</script>

<template>
  <v-list-subheader>{{ $t('Helpers') }}</v-list-subheader>
  <v-divider />

  <span v-if="requests && requests?.length > 0">
    <EventRequestListItem v-for="request of requests" :key="request.id" :request="request"></EventRequestListItem>
  </span>
  <v-list-item v-else>
    <v-row>
      <v-col cols="auto">
        <span v-if="isOverTwoWeeks">
          <i-mdi-information-outline class="text-info" />
          {{ $t('Invitations to helpers will be sent out two weeks before this reventally.') }}
        </span>
        <p v-else class="text-center text-grey">({{ $t('None') }})</p>
      </v-col>
    </v-row>
  </v-list-item>
</template>
