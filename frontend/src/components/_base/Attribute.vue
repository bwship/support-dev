<template>
  <v-row class="mt-0">
    <v-col :cols="isMobile ? 'auto' : '2'">
      <p class="text-right text-grey">
        <v-icon> </v-icon>
        {{ title }}:
      </p>
    </v-col>

    <v-col :cols="isMobile ? 'auto' : '8'">
      <p class="text-left">
        {{ valueFormatted }}
      </p>
    </v-col>
    <v-spacer></v-spacer>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isMobile = ref(false)

const isMobileView = () => window.innerWidth <= 600 // Adjust the breakpoint as needed

const props = defineProps<{
  title?: string
  value?: string
}>()

const valueFormatted = computed(() => {
  if (!props.value?.length) {
    return '-'
  }

  return props.value
})

onMounted(() => {
  // Check the initial screen size on component mount
  isMobile.value = isMobileView()

  // Listen for window resize to update the view
  window.addEventListener('resize', () => {
    isMobile.value = isMobileView()
  })
})
</script>
