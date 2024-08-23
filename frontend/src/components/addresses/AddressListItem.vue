<template>
  <v-list-item :to="{ name: 'addresses-id', params: { id: address.id } }">
    <v-list-item-title>{{ address.streetAddress1 }} {{ address.streetAddress2 }}</v-list-item-title>
    <v-list-item-subtitle>{{ address.city }}, {{ address.state }} {{ address.zip }}</v-list-item-subtitle>
    <v-list-item-subtitle class="mt-2">
      <v-chip class="chip">
        <i-mdi-map-marker />
        {{ $t(address.type) }}
      </v-chip>
    </v-list-item-subtitle>

    <template #append>
      <v-btn class="chevron-right-padding" color="grey" variant="text" size="large">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>

    <v-divider />
  </v-list-item>
</template>

<script setup lang="ts">
import { Address } from '@/models/Address'
import { PropType, computed } from 'vue'

const address = computed(() => {
  return props.address
})

const props = defineProps({
  address: {
    type: Object as PropType<Address>,
    required: true,
  },
})
</script>
