<template>
  <v-list-item :to="{ name: 'companies-id', params: { id: company.id } }">
    <v-list-item-title>{{ company.firstName }}</v-list-item-title>
    <v-list-item-subtitle>{{ company.attributes.website }}</v-list-item-subtitle>

    <template #append>
      <v-btn class="chevron-right-padding" color="grey" variant="text" size="large">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>

    <v-divider />
  </v-list-item>
</template>

<script setup lang="ts">
import { Profile } from '@/models/Profile'
import { PropType, computed } from 'vue'

const company = computed(() => {
  return props.company
})

const props = defineProps({
  company: {
    type: Object as PropType<Profile>,
    required: true,
  },
})
</script>
