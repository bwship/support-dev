<script setup lang="ts">
import useToasts from '@/composables/useToasts'

const { topToast } = useToasts()

const closeClicked = () => {
  if (topToast.value?.show) {
    topToast.value.show = false
  }
}
</script>

<template>
  <v-snackbar
    v-if="topToast"
    v-model="topToast.show"
    :timeout="topToast.timeout"
    :color="topToast.variant"
    location="top right"
    class="snackbar"
  >
    {{ topToast.text }}
    <span v-html="topToast.customHTML"></span>

    <template v-if="topToast.button" #actions>
      <v-btn :color="topToast.buttonColor" variant="text" icon @click="closeClicked">
        <i-mdi-close color="white" />
      </v-btn>
    </template>
  </v-snackbar>
</template>
