<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  (e: 'language-changed', locale?: string): void
}>()

const { t, locale, availableLocales } = useI18n()
const selectedLocale = ref(locale)

const locales = computed(() => {
  return availableLocales.map((l) => {
    return { name: l == 'en' ? t('English') : t('Spanish'), val: l }
  })
})

// Watch for changes in the locale and update selectedLocale accordingly
watch(locale, (newLocale) => {
  selectedLocale.value = newLocale
  // Save the selected locale to localStorage when it changes
  localStorage.setItem('selectedLocale', newLocale)
})

// Watch for changes in selectedLocale and update the application's locale accordingly
watch(selectedLocale, (newSelectedLocale) => {
  // Update the application's locale when selectedLocale changes
  locale.value = newSelectedLocale

  // Save the selected locale to localStorage when it changes
  localStorage.setItem('selectedLocale', newSelectedLocale)

  emit('language-changed', newSelectedLocale)
})

onMounted(() => {
  // Set the selected locale when the component is mounted
  selectedLocale.value = locale.value

  const savedLocale = localStorage.getItem('selectedLocale')
  if (savedLocale) {
    locale.value = savedLocale
  }
})
</script>

<template>
  <v-select
    v-model="selectedLocale"
    :items="locales"
    item-title="name"
    item-value="val"
    variant="solo"
    density="compact"
    :label="$t('Choose Language')"
  ></v-select>
</template>
