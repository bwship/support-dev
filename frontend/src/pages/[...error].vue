<route lang="yaml">
meta:
  public: true
</route>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  statusCode?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  statusCode: '404',
  message: 'Page not found',
})

const { t } = useI18n()
</script>

<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title>
      {{ $t('Houston we have a problem') }}
    </v-card-title>

    <v-divider class="mt-2" />

    <h1 class="text-center text-secondary mt-8">
      {{ props.statusCode }}
    </h1>

    <v-card-text>
      <v-card-text class="text-center text-grey">
        {{ $t(props.message) }}
      </v-card-text>
    </v-card-text>

    <v-divider class="mt-6" />

    <v-card-text class="pb-5">
      <router-link :to="{ name: 'index' }" class="text-decoration-none d-block">
        <v-icon size="x-small">mdi-home</v-icon>
        {{ t('Home') }}
      </router-link>
    </v-card-text>
  </v-card>
</template>

<style scoped>
h1 {
  font-size: 60px;
}
</style>
