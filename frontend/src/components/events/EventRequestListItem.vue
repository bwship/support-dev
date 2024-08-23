<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Request } from '@/models'
import { useProfile } from '@/stores/profile'

const profileStore = useProfile()

const props = defineProps<{
  request: Request
}>()

const isAccepted = computed(() => {
  return props.request.status == 'ACCEPTED' && props.request.ranking && props.request.ranking == 1
})

const isBackup = computed(() => {
  return props.request.status == 'ACCEPTED' && (props.request.ranking || -1) != 1
})

const isInvited = computed(() => {
  return props.request.status == 'INVITED'
})

const profile = computed(() => {
  return profileStore.getProfileById(props.request.profileId)
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
  <span v-if="profile">
    <v-list-item :to="{ name: 'events-id', params: { id: profile.id } }">
      <template v-if="profile" #prepend>
        <Avatar :profile="profile" :height="48" :width="48" class="mr-5"></Avatar>
      </template>

      <v-list-item-title>{{ profile.firstName }} {{ profile.lastName }}</v-list-item-title>

      <v-list-item-subtitle class="pt-2">
        <v-row no-gutters>
          <v-col v-if="isAccepted" cols="12" sm="auto">
            <v-chip class="text-success request-step-status"
              ><i-mdi-checkbox-marked-circle-outline /> {{ $t('Accepted') }}
            </v-chip>
          </v-col>

          <v-col v-if="isBackup" cols="12" sm="auto">
            <v-chip class="text-info request-step-status"><i-mdi-hand-extended-outline /> {{ $t('Backup') }} </v-chip>
          </v-col>

          <v-col v-if="isInvited" cols="12" sm="auto">
            <v-chip class="text-warning request-step-status"><i-mdi-alert /> {{ $t('Invited') }} </v-chip>
          </v-col>
        </v-row>
      </v-list-item-subtitle>

      <template #append>
        <v-btn class="chevron-right-padding" color="grey" variant="text" size="normal">
          <i-mdi-chevron-right />
        </v-btn>
      </template>
    </v-list-item>
  </span>
</template>
