<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { readableDate } from '@/utils/dateUtils'
import { useAddress } from '@/stores/address'
import { useStep } from '@/stores/step'

const addressStore = useAddress()
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const stepStore = useStep()
const showEditDialog = ref(false)

const props = defineProps({
  stepId: { type: Number, default: null },
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

const pickupTime = computed(() =>
  step.value?.transportationAttributes?.pickupAt
    ? readableDate(new Date(step.value.transportationAttributes.pickupAt))
    : ''
)

const startAddressId = computed(() => {
  return step.value?.transportationAttributes?.startAddressId
})

const startAddress = computed(() => {
  return addressStore.getAddressById(startAddressId.value as number)
})

const step = computed(() => {
  return stepStore.steps?.find((s) => s.id == props.stepId)
})

onMounted(async () => {
  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
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

        <v-col cols="3" class="text-right">
          <v-btn variant="text" color="primary" @click="showEditDialog = true">
            <i-mdi-pencil class="mr-1" />
            {{ $t('Edit') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <v-divider />

    <v-card-text class="pb-16 pt-0">
      <v-list>
        <EventRequestListSection :step-id="step.id" />

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

        <span>
          <v-list-subheader class="text-error">{{ $t('Danger Zone') }}</v-list-subheader>
          <v-divider />

          <v-list-item>
            <StepRemove :id="stepId" class="ml-8"></StepRemove>
          </v-list-item>
        </span>
      </v-list>
    </v-card-text>
  </v-card>

  <v-dialog v-model="showEditDialog" :fullscreen="isMobile" width="800" persistent>
    <TransportationEdit v-if="step" :event-id="step?.eventId" :step-id="stepId" @close="showEditDialog = false" />
  </v-dialog>
</template>
