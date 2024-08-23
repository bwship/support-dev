<route lang="yaml">
meta:
  public: true
  transition: slide-fade
</route>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const isMobile = ref(false)
const isMobileView = () => window.innerWidth <= 650
const maxWidth = computed(() => (isMobile.value ? '100%' : '57%'))

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
  <v-card class="mx-auto" max-width="800">
    <v-card-title>
      {{ $t('Beta Registration Form') }}
    </v-card-title>

    <v-card-subtitle>
      {{ $t('Preregister now for the upcoming RBY Beta on February 21st, 2024') }}
    </v-card-subtitle>

    <v-divider class="mt-2" />

    <v-card-text class="pt-10">
      <iframe
        src="https://share.hsforms.com/19FB1XzRLQReFQ3eiJV1jKgqadtr"
        frameborder="0"
        width="100%"
        :height="isMobile ? '2460px' : '2276px'"
      ></iframe>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped></style>
