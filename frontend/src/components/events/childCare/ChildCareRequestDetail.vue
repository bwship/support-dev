<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { Step } from '@/models/Step'
import { computed } from 'vue'
import { readableDate } from '@/utils/dateUtils'
import { useAddress } from '@/stores/address'
import { useProfile } from '@/stores/profile'

const profileStore = useProfile()
const addressStore = useAddress()

const props = defineProps<{
  step: Step
}>()

const addressId = computed(() => {
  return step.value?.childCareAttributes?.addressId
})

const address = computed(() => {
  return addressStore.getAddressById(addressId.value as number)
})

const forDependents = computed(() => {
  const familyMemberIds = step.value?.childCareAttributes?.familyMemberIds || []
  return familyMemberIds.map((m) => profileStore.getProfileById(m)).filter((profile) => profile !== null)
})

const fromTime = computed(() => {
  return step.value?.childCareAttributes?.startAt ? readableDate(new Date(step.value.childCareAttributes.startAt)) : ''
})

const step = computed(() => {
  return props.step
})

const toTime = computed(() => {
  return step.value?.childCareAttributes?.endAt ? readableDate(new Date(step.value.childCareAttributes.endAt)) : ''
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
          <i-mdi-human-male-boy class="mr-2" />
          {{ $t('Child Care') }}
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
          <Attribute :title="$t('From')" :value="fromTime" />
          <Attribute :title="$t('To')" :value="toTime" />
        </v-list-item>

        <v-list-subheader>{{ $t('Watching') }}</v-list-subheader>
        <v-divider />

        <DependentListItem v-for="member in forDependents" :key="member.id" :dependent="member"></DependentListItem>

        <v-list-subheader>{{ $t('Location') }}</v-list-subheader>
        <v-divider />

        <AddressListItem v-if="address" :address="address"></AddressListItem>

        <v-list-item v-if="address"> <Map :address="address"></Map> </v-list-item>

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
