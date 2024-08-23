<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useAddress } from '@/stores/address'
import { Address } from '@/models/Address'
import { useEnum } from '@/stores/enum'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import useToasts from '@/composables/useToasts'

const props = defineProps<{
  id?: number
  companyId?: number
}>()

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'update', id?: number): void
}>()

const { addToast } = useToasts()

const addressStore = useAddress()
const enumStore = useEnum()
const isSaving = ref(false)
const profileStore = useProfile()
const { t } = useI18n()
const autocompleteRef = ref(null)
const streetAddress1 = ref('')
const streetAddress2 = ref('')
const city = ref('')
const description = ref('')
const state = ref() // Abbreviation
const type = ref('HOME')
const zip = ref('')
const addressTextField = ref<HTMLElement | null>(null)
const addressSuggestions = ref<any[]>([])

const states = computed(() => {
  return addressStore.states['USA']
})

const address = computed(() => {
  return addresses.value.find((a) => a.id == props.id)
})

const addresses = computed(() => {
  return addressStore.addresses
})

const addressTypes = computed(() => {
  return enumStore.addressTypes
})

const profile = computed(() => {
  return profileStore.profile
})

const title = computed(() => {
  return props.id ? t('Edit Address') : t('Add Address')
})

const validated = computed(() => {
  return zip.value != '' && state.value != '' && city.value != '' && streetAddress1.value != ''
})

function initAutocomplete() {
  if (addressTextField.value) {
    // Accessing the input element within the v-text-field component
    const inputElement = addressTextField.value.$el.querySelector('input')
    if (inputElement) {
      // Initialize autocomplete service using the input element
      new google.maps.places.Autocomplete(inputElement)
    }
  }
}

function onInput(event: Event) {
  const inputStreetAddress1 = (event.target as HTMLInputElement).value
  streetAddress1.value = inputStreetAddress1

  if (streetAddress1.value.length < 3) {
    addressSuggestions.value = []
  }

  const autocompleteService = new google.maps.places.AutocompleteService()
  autocompleteService.getPlacePredictions({ input: streetAddress1.value }, (predictions, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
      addressSuggestions.value = predictions
    }
  })
}

const cancelClicked = async () => {
  emit('cancel', props.id)
}

const saveClicked = async () => {
  try {
    isSaving.value = true

    const profileId = props.companyId ? props.companyId : profile.value?.id
    const teamId = profile.value?.teamId

    if (!profileId) {
      throw 'no profile'
    }

    const address: Address = {
      id: props.id,
      streetAddress1: streetAddress1.value,
      streetAddress2: streetAddress2.value,
      city: city.value,
      description: description.value,
      profileId,
      state: state.value,
      type: type.value,
      zip: zip.value,
    }

    await addressStore.upsert(address)

    if (teamId) {
      await addressStore.fetchAddresses(teamId, false)
    }

    if (props.companyId) {
      await addressStore.fetchAddressesByCompany(props.companyId, false)
    }

    if (props.id) {
      addToast({ text: t('Address updated successfully'), variant: 'success' })
    } else {
      addToast({ text: t('Address added successfully'), variant: 'success' })
    }

    cancelClicked()
  } catch (error: any) {
    console.error('Error creating address:', error)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isSaving.value = false
  }
}

watch(streetAddress1, (newStreetAddress1) => {
  const suggestion = addressSuggestions.value.find((a) => a.description == newStreetAddress1)

  // Initialize PlacesService
  const dummyDiv = document.createElement('div')
  const placesService = new google.maps.places.PlacesService(dummyDiv) // Pass null instead of a map instance

  if (!suggestion?.place_id) {
    return
  }

  streetAddress1.value = suggestion.structured_formatting?.main_text

  // Fetch place details using place_id
  placesService.getDetails({ placeId: suggestion.place_id }, (placeResult, placeStatus) => {
    if (placeStatus === google.maps.places.PlacesServiceStatus.OK && placeResult) {
      const cityComponent = placeResult.address_components?.find((component) => component.types.includes('locality'))

      city.value = cityComponent ? cityComponent.short_name : ''

      const stateComponent = placeResult.address_components?.find((component) =>
        component.types.includes('administrative_area_level_1')
      )

      state.value = stateComponent ? stateComponent.short_name : ''

      const zipCodeComponent = placeResult.address_components?.find((component) =>
        component.types.includes('postal_code')
      )

      zip.value = zipCodeComponent ? zipCodeComponent.short_name : ''
    }
  })

  addressSuggestions.value = []

  // Blur the autocomplete input element to lose focus
  if (autocompleteRef.value) {
    ;(autocompleteRef.value as any).blur()
  }
})

watch(address, (newAddress) => {
  if (newAddress) {
    streetAddress1.value = newAddress?.streetAddress1
    streetAddress2.value = newAddress.streetAddress2 || ''
    city.value = newAddress.city
    description.value = newAddress.description || ''
    state.value = states.value.find((a) => a.abbreviation == newAddress.state)?.abbreviation
    streetAddress1.value = newAddress.streetAddress1
    type.value = newAddress.type
    zip.value = newAddress.zip
  }
})

onMounted(async () => {
  addressStore.fetchAddresses(profile.value?.teamId as number)
  enumStore.fetchAddressTypes()

  await nextTick()
  initAutocomplete()
})
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <v-btn color="primary" variant="text" text :disabled="isSaving" @click="cancelClicked">Cancel</v-btn>

      <span class="text-center">{{ title }}</span>

      <v-btn
        color="primary"
        :disabled="isSaving || !validated"
        :loading="isSaving"
        variant="elevated"
        @click="saveClicked"
        ><i-mdi-content-save /> {{ $t('Save') }}</v-btn
      >
    </v-card-title>
    <v-divider />

    <v-card-text>
      <v-form autocomplete="off">
        <h5>{{ $t('Basic Information') }}</h5>
        <v-divider />

        <v-autocomplete
          ref="autocompleteRef"
          v-model="streetAddress1"
          :items="addressSuggestions"
          autocomplete="off"
          data-lpignore="true"
          item-title="description"
          item-value="description"
          :label="$t('Street Address 1')"
          required
          :rules="[(v: any) => !!v || 'Street Address is required']"
          @input="onInput"
        />

        <v-text-field v-model="streetAddress2" :label="$t('Street Address 2 (Optional)')"></v-text-field>

        <v-row>
          <v-col>
            <v-text-field
              v-model="city"
              :label="$t('City')"
              required
              :rules="[(v: any) => !!v || 'City is required']"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select
              v-model="state"
              :items="states"
              item-text="title"
              item-value="abbreviation"
              label="State"
              required
              :rules="[(v: any) => !!v || 'State is required']"
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-text-field
              v-model="zip"
              :label="$t('Zip')"
              required
              :rules="[(v: any) => !!v || 'Zip Code is required']"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select v-model="type" item-title="id" :items="addressTypes" label="Type"></v-select>
          </v-col>
        </v-row>

        <h5>{{ $t('Notes') }}</h5>
        <v-divider />
        <v-textarea v-model="description"></v-textarea>
      </v-form>
    </v-card-text>
  </v-card>
</template>
