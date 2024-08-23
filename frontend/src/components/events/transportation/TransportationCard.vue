<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatTime } from '@/utils/dateUtils'
import { stepIcon, Step, isStepAccepted, acceptedProfileId } from '@/models/Step'
import { useAddress } from '@/stores/address'
import { useProfile } from '@/stores/profile'
import { useRouter } from 'vue-router'

const addressStore = useAddress()
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const router = useRouter()
const showEditDialog = ref(false)

const props = defineProps<{
  step: Step
}>()

const acceptedProfile = computed(() => {
  return profileStore.getProfileById(acceptedProfileId(step.value) as number)
})

const endAddressId = computed(() => {
  return step.value?.transportationAttributes?.endAddressId
})

const endAddress = computed(() => {
  return addressStore.getAddressById(endAddressId.value as number)
})

const isAccepted = computed(() => {
  return isStepAccepted(step.value)
})

const hasNotes = computed(() => {
  return step.value.notes?.length
})

const profile = computed(() => {
  return profileStore.profile
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

const teamId = computed(() => {
  return profile.value?.teamId
})

const cardClicked = (event: any, value: any) => {
  const target = event.target as HTMLElement
  const card = target.closest('.event-card')

  if (card) {
    // Extract necessary data and perform action
    router.push({ name: 'events-id', params: { id: step.value.id } })
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

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
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
          <v-chip v-if="isAccepted" class="text-success"
            ><i-mdi-checkbox-marked-circle-outline /> {{ $t('Accepted') }}
          </v-chip>
          <v-chip v-else class="text-warning"><i-mdi-alert /> {{ $t('Pending') }} </v-chip>

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
        <StepRemove :id="step.id" :text-version="false" class="ml-8"></StepRemove>

        <v-btn icon color="primary" @click="showEditDialog = true">
          <i-mdi-pencil />
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>

  <v-dialog v-model="showEditDialog" :fullscreen="isMobile" width="800" persistent>
    <TransportationEdit :event-id="step?.eventId" :step-id="step.id" @close="showEditDialog = false" />
  </v-dialog>
</template>
