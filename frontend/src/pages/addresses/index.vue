<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAddress } from '@/stores/address'
import { useProfile } from '@/stores/profile'
import useToasts from '@/composables/useToasts'

const { addToast } = useToasts()
const addressStore = useAddress()
const isLoading = ref(false)
const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed
const profileStore = useProfile()
const showAddDialog = ref(false)

const addresses = computed(() => {
  return addressStore.addresses
})

const profile = computed(() => {
  return profileStore.profile
})

const refreshAddresses = async () => {
  isLoading.value = true

  try {
    await addressStore.fetchAddresses(profile.value?.teamId as number, false)
  } catch (error: any) {
    console.error('Error refreshing addresses:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isLoading.value = false // Set isLoading back to false when done fetching
  }
}

onMounted(async () => {
  addressStore.fetchAddresses(profile.value?.teamId as number)

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0" prepend-icon="mdi-map">
    <template #title>
      <v-row>
        <v-col cols="9" class="pt-6">{{ $t('Addresses') }}</v-col>

        <v-col :cols="isMobile ? 'auto' : '3'" class="text-right">
          <v-btn color="primary" @click="showAddDialog = true">
            <i-mdi-plus />
            {{ $t('Add Address') }}
          </v-btn>

          <v-btn color="primary" :disabled="isLoading" icon variant="text" @click="refreshAddresses"
            ><i-mdi-refresh />
          </v-btn>

          <v-dialog v-model="showAddDialog" :fullscreen="isMobile" width="800" persistent>
            <AddressEdit @cancel="showAddDialog = false" />
          </v-dialog>
        </v-col>
      </v-row>
    </template>
    <v-divider></v-divider>

    <v-card-text>
      <v-row v-if="addresses?.length">
        <v-col cols="12" class="px-6">
          <MapMultiple v-if="addresses" class="map" :addresses="addresses"></MapMultiple>
        </v-col>
      </v-row>

      <span v-if="isLoading">
        <v-list-subheader>{{ $t('Retrieving Addresses') }}...</v-list-subheader>
        <v-list-item v-for="index in 3" :key="index">
          <v-skeleton-loader type="list-item-avatar"></v-skeleton-loader>
        </v-list-item>
      </span>

      <span v-else>
        <v-list v-if="addresses?.length">
          <template v-for="address in addresses" :key="address.id">
            <AddressListItem :address="address" />
          </template>
        </v-list>
        <v-list v-else>
          <v-list-item class="text-grey text-center">
            {{ $t('(None)') }}
          </v-list-item>
        </v-list>
      </span>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.map {
  margin: 10px;
}
</style>
