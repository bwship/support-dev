<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed } from 'vue'
import { readableDate } from '@/utils/dateUtils'
import { Step } from '@/models/Step'
import { useAddress } from '@/stores/address'

const addressStore = useAddress()

const props = defineProps<{
  step: Step
}>()

const pickupTime = computed(() => {
  return step.value?.transportationAttributes?.pickupAt
    ? readableDate(new Date(step.value.transportationAttributes.pickupAt))
    : ''
})

const step = computed(() => {
  return props.step
})

const startAddressId = computed(() => {
  return step.value?.transportationAttributes?.startAddressId
})

const startAddress = computed(() => {
  return addressStore.getAddressById(startAddressId.value as number)
})

const endAddressId = computed(() => {
  return step.value?.transportationAttributes?.endAddressId
})

const endAddress = computed(() => {
  return addressStore.getAddressById(endAddressId.value as number)
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
          <i-mdi-car class="mr-2" />
          {{ $t('Transportation') }}
        </v-col>

        <v-col cols="3">
          <RequestButtonAccept :step="step" />
          <RequestButtonDecline :step="step" />
        </v-col>
      </v-row>
    </template>
    <v-divider />

    <v-card-text>
      <v-list>
        <RequestStatus :step="step" />

        <v-list-subheader>{{ $t('When') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <Attribute :title="$t('Pickup Time')" :value="pickupTime" />
        </v-list-item>

        <v-list-subheader>{{ $t('From') }}</v-list-subheader>
        <v-divider />

        <v-list-item v-if="startAddress">
          <AddressListItem :address="startAddress"></AddressListItem>
        </v-list-item>

        <v-list-subheader>
          {{ $t('To') }}
        </v-list-subheader>
        <v-divider />

        <v-list-item v-if="endAddress">
          <AddressListItem :address="endAddress"></AddressListItem>
        </v-list-item>

        <v-list-item v-if="startAddress && endAddress">
          <MapMultiple class="map mb-5" :addresses="[startAddress, endAddress]"></MapMultiple>
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
