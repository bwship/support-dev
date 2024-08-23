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
import { useProfile } from '@/stores/profile'

const addressStore = useAddress()
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const stepStore = useStep()
const showEditDialog = ref(false)

const props = defineProps({
  stepId: { type: Number, default: null },
})

const addressId = computed(() => {
  return step.value?.mealAttributes?.addressId
})

const address = computed(() => {
  return addressStore.getAddressById(addressId.value as number)
})

const dropoffTime = computed(() =>
  step.value?.mealAttributes?.dropoffAt ? readableDate(new Date(step.value.mealAttributes.dropoffAt)) : ''
)

const forDependents = computed(() => {
  const familyMemberIds = step.value?.childCareAttributes?.familyMemberIds || []
  return familyMemberIds.map((m) => profileStore.getProfileById(m)).filter((profile) => profile !== null)
})

const notes = computed(() => {
  return step.value?.notes || ''
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
          <i-mdi-silverware class="mr-2" />
          {{ $t('Meal') }}
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
        <EventRequestListSection :step-id="step?.id" />

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
          <Map :address="address"></Map>
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
    <MealEdit :event-id="step?.eventId" :step-id="stepId" @close="showEditDialog = false" />
  </v-dialog>
</template>
