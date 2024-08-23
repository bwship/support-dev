<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfile } from '@/stores/profile'

const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 600
const route = useRoute()
const profileStore = useProfile()
const showEditDialog = ref(false)
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

const dependent = computed(() => {
  return dependents.value.find((a) => a.id == id.value)
})

const dependents = computed(() => {
  return profileStore.dependents(true)
})

const disabilityAccommodationsDescription = computed(() => {
  return dependent.value?.attributes?.disabilityAccommodationsDescription
    ? dependent.value?.attributes?.disabilityAccommodationsDescription
    : '(None)'
})

const foodAllergyDescription = computed(() => {
  return dependent.value?.attributes?.foodAllergyDescription
    ? dependent.value?.attributes?.foodAllergyDescription
    : '(None)'
})

const foodPreferencesDescription = computed(() => {
  return dependent.value?.attributes?.foodPreferencesDescription
    ? dependent.value?.attributes?.foodPreferencesDescription
    : '(None)'
})

const fullName = computed(() => {
  return `${dependent.value?.firstName} ${dependent.value?.lastName}`
})

const profile = computed(() => {
  return profileStore.profile
})

const dependentRemoved = async () => {
  router.push({ name: 'dependents' })
}

onMounted(async () => {
  profileStore.fetchTeammates(profile.value?.teamId as number)

  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>

<template>
  <v-card class="mx-auto full-height" elevation="0">
    <template #title>
      <v-row>
        <v-col cols="8">
          <v-btn icon color="primary" variant="text" :to="{ name: 'contacts' }"><i-mdi-chevron-left /></v-btn>
          <i-mdi-human-male-boy class="mr-2 mt-4" />
          {{ fullName }}
        </v-col>

        <v-col cols="4" class="text-right">
          <v-btn variant="text" class="mt-4" color="primary" @click="showEditDialog = true">
            <i-mdi-pencil class="mr-1" />
            {{ $t('Edit') }}
          </v-btn>

          <v-dialog v-model="showEditDialog" :fullscreen="isMobile" width="800" persistent>
            <DependentEdit :id="id" @cancel="showEditDialog = false" />
          </v-dialog>
        </v-col>
      </v-row>
    </template>
    <v-divider></v-divider>

    <v-card-text class="text-center">
      <ProfileImageUpload :profile="dependent" :enable-edit="true" />
    </v-card-text>

    <v-divider />

    <v-card-text class="pb-16 pl-12 pr-12 pt-0">
      <v-list>
        <v-list-subheader class="headline">{{ $t('Basic Information') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col>
              <Attribute :title="$t('First Name')" :value="dependent?.firstName" />
              <Attribute :title="$t('Last Name')" :value="dependent?.lastName" />
              <Attribute
                :title="$t('Relationship')"
                :value="$t(dependent?.relationshipAttributes?.familyMemberType || '(Unknown)')"
              />
            </v-col>
          </v-row>
        </v-list-item>

        <v-list-subheader>{{ $t('Food Allergies') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <p v-if="foodAllergyDescription">{{ foodAllergyDescription }}</p>
              <p v-else class="text-center text-grey">({{ $t('None') }})</p>
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Food Preferences -->
        <v-list-subheader>{{ $t('Food Preferences') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <p v-if="foodPreferencesDescription">{{ foodPreferencesDescription }}</p>
              <p v-else class="text-center text-grey">({{ $t('None') }})</p>
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Disabilities & Accommodations -->
        <v-list-subheader>{{ $t('Disabilities & Accommodations') }}</v-list-subheader>
        <v-divider />

        <v-list-item>
          <v-row>
            <v-col cols="auto">
              <p v-if="disabilityAccommodationsDescription">{{ disabilityAccommodationsDescription }}</p>
              <p v-else class="text-center text-grey">({{ $t('None') }})</p>
            </v-col>
          </v-row>
        </v-list-item>

        <v-list-subheader class="text-error">{{ $t('Danger Zone') }}</v-list-subheader>
        <v-divider />

        <v-list-item><DependentRemove @remove="dependentRemoved" /></v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
