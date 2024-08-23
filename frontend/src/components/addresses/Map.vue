<script setup lang="ts">
import { useAddress } from '@/stores/address'
import { Address } from '@/models/Address'
import { onMounted } from 'vue'
import { ref } from 'vue'

const addressStore = useAddress()
const mapElement = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)

const props = defineProps<{
  address: Address
}>()

onMounted(async () => {
  const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary

  const { location } = props.address

  if (location) {
    map.value = new Map(mapElement.value as HTMLElement, {
      center: props.address.location,
      zoom: 12,
      mapTypeId: 'roadmap',
      streetViewControl: false,
      mapTypeControl: false,
    })

    new google.maps.Marker({
      position: props.address.location,
      map: map.value,
    })
  }
})
</script>

<template>
  <div ref="mapElement" class="map"></div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 250px;
  border-radius: 20px;
  padding: 20px;
  background-color: #e0e0e0;
}
</style>
