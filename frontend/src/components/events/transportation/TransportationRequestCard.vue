<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { formatTime } from '@/utils/dateUtils'
import { stepIcon, Step } from '@/models/Step'
import { useAddress } from '@/stores/address'
import { useRouter } from 'vue-router'
import { useProfile } from '@/stores/profile'

const addressStore = useAddress()
const profileStore = useProfile()
const router = useRouter()

const props = defineProps<{
  step: Step
}>()

const endAddressId = computed(() => {
  return step.value?.transportationAttributes?.endAddressId
})

const endAddress = computed(() => {
  return addressStore.getAddressById(endAddressId.value as number)
})

const startAddressId = computed(() => {
  return step.value?.transportationAttributes?.startAddressId
})

const startAddress = computed(() => {
  return addressStore.getAddressById(startAddressId.value as number)
})

const step = computed(() => {
  return props.step
})

const hasNotes = computed(() => {
  return step.value.notes?.length
})

const acceptedProfile = computed(() => {
  return isAccepted.value ? profileStore.getProfileById(request?.value?.profileId as number) : undefined
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
      :subtitle="`${$t('Pickup At')}: ${formatTime(step.transportationAttributes.pickupAt)}`"
    >
      <v-divider />

      <template v-if="acceptedProfile" #append>
        <Avatar :profile="acceptedProfile" :height="48" :width="48" class="mr-5"></Avatar>
      </template>

      <v-card-text>
        <v-chip-group>
          <RequestStatusChip :step="step" />
          <v-chip>
            <i-mdi-car class="mr-2" />
            {{ $t('From') }}: {{ $t(startAddress.type) }} -
            {{ $t(endAddress.type) }}
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
