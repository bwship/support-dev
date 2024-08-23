<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { formatTime } from '@/utils/dateUtils'
import { stepIcon, Step, isStepAccepted, acceptedProfileId } from '@/models/Step'
import { useAddress } from '@/stores/address'
import { useRouter } from 'vue-router'
import { useProfile } from '@/stores/profile'

const addressStore = useAddress()
const profileStore = useProfile()
const router = useRouter()

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

onMounted(async () => {
  if (teamId.value) {
    profileStore.fetchTeammates(teamId.value)
    addressStore.fetchAddresses(teamId.value)
  }
})
</script>

<template>
  <v-list-item :to="{ name: 'events-id', params: { id: step.id } }">
    <template v-if="acceptedProfile" #prepend>
      <Avatar :profile="acceptedProfile" :height="48" :width="48" class="mr-5"></Avatar>
    </template>

    <v-list-item-title>
      <v-icon :icon="stepIcon(step)" />
      {{ $t(step.type) }}
    </v-list-item-title>

    <v-list-item-subtitle class="mt-2 mb-3">
      {{ $t('Pickup at') }}: {{ formatTime(step.transportationAttributes.pickupAt) }}
    </v-list-item-subtitle>

    <v-list-item-subtitle class="pt-2">
      <v-row no-gutters>
        <v-col cols="12" sm="auto">
          <v-chip v-if="isAccepted" class="text-success"
            ><i-mdi-checkbox-marked-circle-outline /> {{ $t('Accepted') }}
          </v-chip>
          <v-chip v-else class="text-warning"><i-mdi-alert /> {{ $t('Pending') }} </v-chip>
        </v-col>

        <v-col cols="12" sm="auto">
          <v-chip>
            <i-mdi-car class="mr-2" />
            {{ $t('From') }}: {{ $t(startAddress.type) }} -
            {{ $t(endAddress.type) }}
          </v-chip>
        </v-col>

        <v-col v-if="hasNotes" cols="12" sm="auto">
          <v-chip><i-mdi-notes />{{ $t('Notes') }}</v-chip>
        </v-col>
      </v-row>
    </v-list-item-subtitle>

    <template #append>
      <v-btn class="chevron-right-padding" color="grey" variant="text" size="large">
        <i-mdi-chevron-right />
      </v-btn>
    </template>

    <v-divider />
  </v-list-item>
</template>
