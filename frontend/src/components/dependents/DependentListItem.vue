<script setup lang="ts">
import { PropType } from 'vue'
import { Profile } from '@/models'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  dependent: {
    type: Object as PropType<Profile>,
    required: true,
  },
})
</script>

<template>
  <v-list-item :to="{ name: 'dependents-id', params: { id: dependent.id } }">
    <template #prepend>
      <Avatar :profile="dependent" :height="48" :width="48" class="mr-5"></Avatar>
    </template>

    <v-list-item-title>{{ dependent.firstName }} {{ dependent.lastName }}</v-list-item-title>

    <v-list-item-subtitle class="pt-2">
      <v-row no-gutters>
        <v-chip>
          <i-mdi-human-male-child />
          {{
            dependent.relationshipAttributes && dependent.relationshipAttributes.familyMemberType
              ? $t(dependent.relationshipAttributes.familyMemberType)
              : $t('Dependent')
          }}
        </v-chip>
        <v-chip
          v-if="
            dependent.attributes.foodAllergyDescription && dependent.attributes.foodAllergyDescription.trim() !== ''
          "
          class="ml-2 text-warning"
        >
          <v-icon color="warning" left>mdi-alert</v-icon>
          {{ $t('Food Allergies') }}
        </v-chip>

        <v-chip
          v-if="
            dependent.attributes.foodPreferencesDescription &&
            dependent.attributes.foodPreferencesDescription.trim() !== ''
          "
          class="ml-2 text-warning"
        >
          <v-icon color="warning" left>mdi-alert</v-icon>
          {{ $t('Food Preferences') }}
        </v-chip>

        <v-chip
          v-if="
            dependent.attributes.disabilityAccommodationsDescription &&
            dependent.attributes.disabilityAccommodationsDescription.trim() !== ''
          "
          class="ml-2 text-warning"
        >
          <v-icon color="warning" left>mdi-alert</v-icon>
          {{ $t('Disability') }}
        </v-chip>
      </v-row>
    </v-list-item-subtitle>

    <template #append>
      <v-btn class="chevron-right-padding" color="grey" variant="text" size="large">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>

    <v-divider />
  </v-list-item>
</template>
