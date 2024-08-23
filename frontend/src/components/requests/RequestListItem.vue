<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Step, getStepDescription } from '@/models/Step'
import { useRequest } from '@/stores/request'
import { useRouter } from 'vue-router'
import { useProfile } from '@/stores/profile'

const requestStore = useRequest()
const profileStore = useProfile()
const router = useRouter()

const props = defineProps<{
  step: Step
}>()

const step = computed(() => {
  return props.step
})

const stepDescription = computed(() => {
  return getStepDescription(step.value, true)
})

const hasNotes = computed(() => {
  return step.value.notes?.length
})

const acceptedProfile = computed(() => {
  if (isAccepted.value || isBackup.value) {
    const profileId = request?.value?.profileId as number
    const profile = profileStore.getProfileById(profileId)
    return profile
  }

  return undefined
})

const profile = computed(() => {
  return profileStore.profile
})

const request = computed(() => {
  if (profile.value) {
    return requestStore.requestMap.get(step.value.id)?.find((a) => a.profileId == profile.value?.id)
  }
  return undefined
})

const isAccepted = computed(() => {
  return request.value?.status == 'ACCEPTED' && request.value.ranking && request.value.ranking == 1
})

const isBackup = computed(() => {
  return request.value?.status == 'ACCEPTED' && (request.value.ranking || -1) != 1
})

const isRankPending = computed(() => {
  return request.value?.status == 'ACCEPTED' && !request.value.ranking
})

const isInvited = computed(() => {
  return request.value?.status == 'INVITED'
})

const isTentative = computed(() => {
  return request.value?.status == 'TENTATIVE'
})

const isDeclined = computed(() => {
  return request.value?.status == 'DECLINED'
})

const isChildCare = computed(() => {
  return step.value.type == 'CHILD_CARE'
})

const isMeal = computed(() => {
  return step.value.type == 'MEAL'
})

const isTransportation = computed(() => {
  return step.value.type == 'TRANSPORTATION'
})

function handleClick() {
  router.push({ name: 'requests-id', params: { id: step.value.id } })
}

onMounted(async () => {
  requestStore.fetchRequests(props.step.id)
})
</script>

<template>
  <v-list-item v-if="!isDeclined" @click="handleClick">
    <template #prepend>
      <Avatar :profile="acceptedProfile" :height="48" :width="48" class="mr-5"></Avatar>
    </template>

    <v-list-item-title>{{ stepDescription }}</v-list-item-title>

    <v-list-item-subtitle class="pt-2">
      <v-row no-gutters>
        <v-col v-if="isChildCare" cols="12" sm="auto">
          <v-chip><i-mdi-human-male-boy />{{ $t('Child Care') }}</v-chip>
        </v-col>
        <v-col v-if="isMeal" cols="12" sm="auto">
          <v-chip><i-mdi-silverware />{{ $t('Meal') }}</v-chip>
        </v-col>
        <v-col v-if="isTransportation" cols="12" sm="auto">
          <v-chip><i-mdi-car />{{ $t('Transportation') }}</v-chip>
        </v-col>

        <v-col v-if="isAccepted" cols="12" sm="auto">
          <v-chip class="text-success request-step-status"
            ><i-mdi-checkbox-marked-circle-outline /> {{ $t('Accepted') }}
          </v-chip>
        </v-col>

        <v-col v-if="isBackup" cols="12" sm="auto">
          <v-chip class="text-info request-step-status"><i-mdi-hand-extended-outline /> {{ $t('Backup') }} </v-chip>
        </v-col>

        <v-col v-if="isDeclined" cols="12" sm="auto">
          <v-chip class="text-grey request-step-status"><i-mdi-close /> {{ $t('Declined') }} </v-chip>
        </v-col>

        <v-col v-if="isTentative" cols="12" sm="auto">
          <v-chip class="text-warning request-step-status"><i-mdi-progress-question /> {{ $t('Tentative') }} </v-chip>
        </v-col>

        <v-col v-if="isInvited" cols="12" sm="auto">
          <v-chip class="text-warning request-step-status"><i-mdi-alert /> {{ $t('Invited') }} </v-chip>
        </v-col>

        <v-col v-if="isRankPending" cols="12" sm="auto">
          <v-chip class="text-warning request-step-status"><i-mdi-timer-sand /> {{ $t('Pending Rank') }} </v-chip>
        </v-col>

        <v-col v-if="hasNotes" cols="12" sm="auto">
          <v-chip v-if="hasNotes"><i-mdi-notes />{{ $t('Notes') }}</v-chip>
        </v-col>
      </v-row>
    </v-list-item-subtitle>

    <template #append>
      <v-btn class="chevron-right-padding" color="grey" variant="text" size="normal">
        <i-mdi-chevron-right />
      </v-btn>
    </template>
  </v-list-item>
</template>
