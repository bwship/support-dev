<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { useProfile } from '@/stores/profile'

const profileStore = useProfile()
const showLanguageDialog = ref(false)
const showThemeDialog = ref(false)

const id = computed(() => {
  return profile.value?.id
})

const profile = computed(() => {
  return profileStore.profile
})
</script>

<template>
  <v-menu ref="profileMenu" offset-y>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon class="ml-4"> <i-mdi-dots-vertical /></v-btn>
    </template>

    <v-list class="bordered-list">
      <v-list-item :to="{ name: 'profile' }">
        <template #prepend>
          <i-mdi-account-circle />
        </template>

        <v-list-item-title class="pl-2">{{ $t('Profile') }}</v-list-item-title>
      </v-list-item>

      <v-divider />

      <v-list-item @click="showLanguageDialog = true">
        <template #prepend>
          <i-mdi-flag />
        </template>

        <v-list-item-title class="pl-2"> {{ $t('Language') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="showThemeDialog = true">
        <template #prepend>
          <i-mdi-theme-light-dark />
        </template>

        <v-list-item-title class="pl-2"> {{ $t('Theme') }}</v-list-item-title>
      </v-list-item>

      <v-divider />

      <Logout />
    </v-list>
  </v-menu>

  <v-dialog v-model="showLanguageDialog" width="400" persistent>
    <ChooseLanguageDialog :id="id" @cancel="showLanguageDialog = false" />
  </v-dialog>

  <v-dialog v-model="showThemeDialog" width="400" persistent>
    <ChooseThemeDialog :id="id" @cancel="showThemeDialog = false" />
  </v-dialog>
</template>
