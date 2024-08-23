<template>
  <div ref="mapElement" class="map"></div>
</template>

<script setup lang="ts">
import { Address, LatLng } from '@/models/Address'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mapElement = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)

const props = defineProps<{
  addresses: Address[]
}>()

onMounted(async () => {
  const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary

  map.value = new Map(mapElement.value as HTMLElement, {
    center: { lat: 0, lng: 0 },
    zoom: 12,
    mapTypeId: 'roadmap',
    streetViewControl: false,
    mapTypeControl: false,
  })

  // add the address locations
  for (const address of props.addresses.filter((a) => a.location)) {
    const marker = new google.maps.Marker({
      position: address.location,
      map: map.value,
      title: address?.city,
    })

    marker.addListener('click', function () {
      router.push({ name: 'addresses-id', params: { id: address.id } })
    })
  }

  // center the map
  const bounds = new google.maps.LatLngBounds()
  for (const address of props.addresses.filter((a) => a.location)) {
    bounds.extend(address.location as LatLng)
  }

  map.value?.fitBounds(bounds)
})
</script>

<style scoped>
.map {
  width: 100%;
  height: 500px;
  border-radius: 20px;
  padding: 20px;
  background-color: #e0e0e0;
}
</style>
