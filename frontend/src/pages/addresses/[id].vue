<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAddress } from '@/stores/address'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const auth = useAuth()
const route = useRoute()
const router = useRouter()
const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})
const id = computed(() => {
  return Number(props.id || route.params.id)
})
const addressStore = useAddress()
const profileStore = useProfile()
const showEditDialog = ref(false)

const address = computed(() => {
  return addresses.value.find((a) => a.id == id.value)
})

const addresses = computed(() => {
  return addressStore.addresses
})

const profile = computed(() => {
  return profileStore.profile
})

const isDeleteOrEditEnabled = computed(() => {
  const profileRoles = profile?.value?.roles || []

  return (
    profile?.value?.id === address.value?.profileId ||
    profileRoles.some((role) => ['TEAM_ADMIN', 'TEAM_OWNER'].includes(role))
  )
})

const addressRemoved = async () => {
  router.push({ name: 'contacts' })
}

onMounted(async () => {
  addressStore.fetchAddresses(profile.value?.teamId as number)
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0">
    <template #title>
      <v-row>
        <v-col cols="9">
          <v-btn icon color="primary" variant="text" :to="{ name: 'contacts' }"><i-mdi-chevron-left /></v-btn>
          <i-mdi-map class="mr-2 mt-4" />
          {{ address?.streetAddress1 }}
        </v-col>

        <v-col cols="3" class="text-right">
          <v-btn
            v-if="isDeleteOrEditEnabled"
            class="mt-3"
            variant="text"
            color="primary"
            @click="showEditDialog = true"
          >
            <i-mdi-pencil class="mr-1" />
            {{ $t('Edit') }}
          </v-btn>

          <v-dialog v-model="showEditDialog" width="800" persistent>
            <AddressEdit :id="id" @cancel="showEditDialog = false" />
          </v-dialog>
        </v-col>
      </v-row>
    </template>
    <v-divider></v-divider>

    <v-card-text class="text-center">
      <v-row>
        <v-col cols="10" offset="1" class="px-6 py-6">
          <Map v-if="address" :address="address"></Map>
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider />

    <v-card-text class="pb-16 pl-12 pr-12 pt-0">
      <v-list>
        <v-list-subheader class="headline">{{ $t('Basic Information') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col>
              <Attribute :title="$t('Street Address 1')" :value="address?.streetAddress1" />
              <Attribute :title="$t('Street Address 2')" :value="address?.streetAddress2" />
              <Attribute :title="$t('City')" :value="address?.city" />
              <Attribute :title="$t('State')" :value="address?.state" />
              <Attribute :title="$t('Zip')" :value="address?.zip" />
              <Attribute :title="$t('Type')" :value="t(address?.type ?? '')" />
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Notes Section -->
        <v-list-subheader class="headline">{{ $t('Notes') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <p v-if="address?.description">{{ address.description }}</p>
              <p v-else class="text-center text-grey">({{ $t('None') }})</p>
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Danger Zone -->
        <span v-if="isDeleteOrEditEnabled">
          <v-list-subheader class="text-error">{{ $t('Danger Zone') }}</v-list-subheader>
          <v-divider />

          <v-list-item><AddressRemove @remove="addressRemoved" /></v-list-item>
        </span>
      </v-list>
    </v-card-text>
  </v-card>
</template>
