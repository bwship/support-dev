<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { formatTime } from '@/utils/dateUtils'
import { stepIcon, Step } from '@/models/Step'
import { useAddress } from '@/stores/address'
import { useProfile } from '@/stores/profile'
import { useRouter } from 'vue-router'

const addressStore = useAddress()
const profileStore = useProfile()
const router = useRouter()

const props = defineProps<{
  step: Step
}>()

const acceptedProfile = computed(() => {
  return isAccepted.value ? profileStore.getProfileById(request?.value?.profileId as number) : undefined
})

const addressId = computed(() => {
  return step.value?.mealAttributes?.addressId
})

const address = computed(() => {
  return addressStore.getAddressById(addressId.value as number)
})

const forDependents = computed(() => {
  const familyMemberIds = step.value?.childCareAttributes?.familyMemberIds || []
  const profiles = familyMemberIds.map((m) => profileStore.getProfileById(m)).filter((profile) => profile !== null)

  return profiles.map((profile) => profile?.firstName).join(', ')
})

const step = computed(() => {
  return props.step
})

const hasNotes = computed(() => {
  return step.value.notes?.length
})

const profile = computed(() => {
  return profileStore.profile
})

const request = computed(() => {
  return profile.value ? step.value.requests.find((r) => r.profileId == profile.value?.id) : undefined
})

const isAccepted = computed(() => {
  return request.value?.status == 'ACCEPTED' && request.value.ranking && request.value.ranking == 1
})

const isBackup = computed(() => {
  return request.value?.status == 'ACCEPTED' && (request.value.ranking || -1) != 1
})

const teamId = computed(() => {
  return profile.value?.teamId
})

const cardClicked = (event: any, value: any) => {
  const target = event.target as HTMLElement
  const card = target.closest('.event-card')

  if (card) {
    // Extract necessary data and perform action
    router.push({ name: 'requests-id', params: { id: step.value.id } })
  }
}

const handleMouseOver = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const card = target.closest('.event-card')

  if (card) {
    card.classList.add('highlight') // Add highlight class on mouse over
  }
}

const handleMouseOut = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const card = target.closest('.event-card')

  if (card) {
    card.classList.remove('highlight') // Remove highlight class on mouse out
  }
}
onMounted(async () => {
  if (teamId.value) {
    profileStore.fetchTeammates(teamId.value)
    addressStore.fetchAddresses(teamId.value)
  }
})
</script>

<template>
  <div class="card-container" @click="cardClicked" @mouseover="handleMouseOver" @mouseout="handleMouseOut">
    <v-card
      color="background"
      elevation="4"
      class="event-card"
      :prepend-icon="stepIcon(step)"
      :title="$t(step.type)"
      :subtitle="`${$t('From')}: ${formatTime(step.childCareAttributes?.startAt)} - ${formatTime(
        step.childCareAttributes?.endAt
      )}`"
    >
      <v-divider />

      <template v-if="acceptedProfile" #append>
        <Avatar :profile="acceptedProfile" :height="48" :width="48" class="mr-5"></Avatar>
      </template>

      <v-card-text>
        <v-chip-group>
          <RequestStatusChip :step="step" />

          <v-chip v-if="address">
            <i-mdi-map-marker />
            {{ $t('Location') }}: {{ $t(address.type) }}
          </v-chip>

          <v-chip>
            <i-mdi-human-male-boy class="mr-2" />
            {{ $t('Watching') }}: {{ forDependents }}
          </v-chip>

          <v-chip v-if="hasNotes"><i-mdi-notes />{{ $t('Notes') }}</v-chip>
        </v-chip-group>
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <RequestButtonAccept v-if="!isAccepted && !isBackup" :step="step" />
        <RequestButtonDecline v-if="!isAccepted && !isBackup" :step="step" />
      </v-card-actions>
    </v-card>
  </div>
</template>
