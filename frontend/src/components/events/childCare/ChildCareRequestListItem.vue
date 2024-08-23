<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { formatTime } from '@/utils/dateUtils'
import { stepIcon, Step, acceptedProfileId } from '@/models/Step'
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

const isAccepted = computed(() => {
  return request.value?.status == 'ACCEPTED' && request.value.ranking && request.value.ranking == 1
})

const request = computed(() => {
  return profile.value ? step.value.requests.find((r) => r.profileId == profile.value?.id) : undefined
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

const teamId = computed(() => {
  return profile.value?.teamId
})

function handleClick() {
  router.push({ name: 'requests-id', params: { id: step.value.id } })
}

onMounted(async () => {
  if (teamId.value) {
    profileStore.fetchTeammates(teamId.value)
    addressStore.fetchAddresses(teamId.value)
  }
})
</script>

<template>
  <v-list-item @click="handleClick">
    <template v-if="acceptedProfile" #prepend>
      <Avatar :profile="acceptedProfile" :height="48" :width="48" class="mr-5"></Avatar>
    </template>

    <v-list-item-title>
      <v-icon :icon="stepIcon(step)" />
      {{ $t(step.type) }}
    </v-list-item-title>

    <v-list-item-subtitle class="pt-2">
      <v-chip-group>
        <RequestStatusChip :step="step" />
        <v-chip>
          <i-mdi-calendar-clock class="mr-2" />
          {{ $t('From') }}: {{ formatTime(step.childCareAttributes.startAt) }} -
          {{ formatTime(step.childCareAttributes.endAt) }}
        </v-chip>
        <v-chip>
          <i-mdi-human-male-boy class="mr-2" />
          {{ $t('Watching') }}: {{ forDependents }}
        </v-chip>
        <v-chip v-if="address">
          <i-mdi-map-marker />
          {{ $t('Location') }}: {{ $t(address.type) }}
        </v-chip>
        <v-chip v-if="hasNotes"><i-mdi-notes />{{ $t('Notes') }}</v-chip>
      </v-chip-group>
    </v-list-item-subtitle>

    <template #append>
      <v-btn class="chevron-right-padding" color="grey" variant="text" size="large">
        <i-mdi-chevron-right />
      </v-btn>
    </template>

    <v-divider />
  </v-list-item>
</template>
