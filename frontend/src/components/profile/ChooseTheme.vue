<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

const emit = defineEmits<{
  (e: 'theme-changed', theme?: string): void
}>()

const { t } = useI18n()
const selectedTheme = ref('darkTheme')
const theme = useTheme()

const themes = computed(() => {
  return [
    {
      name: t('Dark'),
      val: 'darkTheme',
    },
    {
      name: t('Light'),
      val: 'lightTheme',
    },
  ]
})

const toggleTheme = () => {
  theme.global.name.value = selectedTheme.value
  localStorage.setItem('selectedTheme', selectedTheme.value)
}

watch(selectedTheme, (newSelectedTheme) => {
  emit('theme-changed', newSelectedTheme)
})

onMounted(() => {
  const savedTheme = localStorage.getItem('selectedTheme')
  if (savedTheme) {
    selectedTheme.value = savedTheme
    toggleTheme()
  }
})
</script>

<template>
  <v-select
    v-model="selectedTheme"
    density="compact"
    variant="solo"
    :items="themes"
    item-title="name"
    item-value="val"
    :label="$t('Choose Theme')"
    @update:modelValue="toggleTheme"
  ></v-select>
</template>
