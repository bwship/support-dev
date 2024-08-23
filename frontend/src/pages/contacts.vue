<route lang="yaml">
meta:
  layout: main
  transition: slide-fade
</route>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuth } from '@/auth/useAuth'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/stores/profile'
import HelpersPage from '@/pages/helpers/index.vue'
import DependentsPage from '@/pages/dependents/index.vue'
import AddressesPage from '@/pages/addresses/index.vue'

const auth = useAuth()
const profileStore = useProfile()
const { t } = useI18n()
const tab = ref(0)

const tabs = [
  {
    name: 'helpers',
    to: { name: 'helpers' },
    icon: 'i-mdi-account-group',
    title: t('Helpers'),
    component: HelpersPage,
  },
  {
    name: 'dependents',
    to: { name: 'dependents' },
    icon: 'i-mdi-human-male-boy',
    title: t('Dependents'),
    component: DependentsPage,
  },
  { name: 'addresses', to: { name: 'addresses' }, icon: 'i-mdi-map', title: t('Addresses'), component: AddressesPage },
]

watch(tab, (newValue) => {
  localStorage.setItem('contacts-last-tab', String(newValue))
})

onMounted(async () => {
  tab.value = Number(localStorage.getItem('contacts-last-tab') || 0)
})
</script>

<template>
  <v-tabs v-model="tab">
    <v-tab v-for="item in tabs" :key="item.name">{{ item.title }}</v-tab>
  </v-tabs>

  <div v-for="(item, index) in tabs" :key="item.name">
    <div v-if="tab == index">
      <component :is="item.component"></component>
    </div>
  </div>
</template>
