<script setup lang="ts">
import { computed } from 'vue'
import { Step } from '@/models/Step'
import { useProfile } from '@/stores/profile'

const profileStore = useProfile()

const props = defineProps<{
  step: Step
}>()

const isAccepted = computed(() => {
  return !!(request.value?.status == 'ACCEPTED' && (request.value?.ranking || -1) == 1)
})

const isBackup = computed(() => {
  return request.value?.status == 'ACCEPTED' && (request.value?.ranking || -1) != 1
})

const profile = computed(() => {
  return profileStore.profile
})

const request = computed(() => {
  return profile.value ? step?.value?.requests?.find((r) => r.profileId == profile.value?.id) : undefined
})

const step = computed(() => {
  return props.step
})
</script>

<template>
  <v-chip v-if="isAccepted" class="text-success"><i-mdi-checkbox-marked-circle-outline /> {{ $t('Accepted') }} </v-chip>
  <v-chip v-if="isBackup" class="text-info"><i-mdi-hand-extended-outline /> {{ $t('Backup') }} </v-chip>
  <v-chip v-else class="text-warning"><i-mdi-alert /> {{ $t('Pending') }} </v-chip>
</template>
