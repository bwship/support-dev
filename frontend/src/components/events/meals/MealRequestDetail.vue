<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed } from 'vue'
import { readableDate } from '@/utils/dateUtils'
import { useAddress } from '@/stores/address'
import { useProfile } from '@/stores/profile'
import { Step } from '@/models/Step'

const addressStore = useAddress()
const profileStore = useProfile()

const props = defineProps<{
  step: Step
}>()

const step = computed(() => {
  return props.step
})

const addressId = computed(() => {
  return step.value?.mealAttributes?.addressId
})

const address = computed(() => {
  if (addressId.value) {
    return addressStore.getAddressById(addressId.value)
  }
  return null
})

const forDependents = computed(() => {
  const familyMemberIds = step.value?.childCareAttributes?.familyMemberIds || []
  const profiles = familyMemberIds.map((m) => profileStore.getProfileById(m)).filter((profile) => profile !== null)

  return profiles.map((profile) => profile?.firstName).join(', ')
})

const dropoffTime = computed(() => {
  if (step.value?.mealAttributes?.dropoffAt) {
    return readableDate(new Date(step.value.mealAttributes.dropoffAt))
  }
  return ''
})

const notes = computed(() => {
  return step.value?.notes || ''
})
</script>

<template>
  <v-card elevation="0">
    <template #title>
      <v-row>
        <v-col cols="9">
          <v-btn icon color="primary" variant="text" :to="{ name: 'events' }"><i-mdi-chevron-left /></v-btn>
          <i-mdi-silverware class="mr-2" />
          {{ $t('Meal') }}
        </v-col>

        <v-col cols="3">
          <RequestButtonAccept :step="step" />
          <RequestButtonDecline :step="step" />
        </v-col>
      </v-row>
    </template>
    <v-divider />

    <v-card-text class="pb-16 pt-0">
      <v-list>
        <RequestStatus :step="step" />

        <v-list-subheader>{{ $t('When') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <Attribute :title="$t('Drop Off')" :value="dropoffTime" />
        </v-list-item>

        <v-list-subheader>{{ $t('For') }}</v-list-subheader>
        <v-divider />

        <DependentListItem v-for="member in forDependents" :key="member.id" :dependent="member"></DependentListItem>

        <v-list-subheader>{{ $t('Deliver To') }}</v-list-subheader>
        <v-divider />

        <AddressListItem v-if="address" :address="address"></AddressListItem>

        <v-list-item v-if="address">
          <Map v-if="address" :address="address"></Map>
        </v-list-item>

        <v-list-subheader>{{ $t('Notes') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <p v-if="notes">{{ notes }}</p>
              <p v-else class="text-center text-grey">({{ $t('None') }})</p>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
