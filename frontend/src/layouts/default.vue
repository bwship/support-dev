<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

const { t } = useI18n()
const selectedTheme = ref('darkTheme')
const theme = useTheme()

const footerLinks = computed(() => {
  return [
    { icon: 'mdi-home', label: t('Home'), url: 'https://support.dev' },
    { icon: 'mdi-security', label: t('Privacy Policy'), url: 'https://support.dev/privacy-policy' },
    { icon: 'mdi-gavel', label: t('Terms'), url: 'https://support.dev/terms-and-conditions' },
  ]
})

const toggleTheme = () => {
  theme.global.name.value = selectedTheme.value
  localStorage.setItem('selectedTheme', selectedTheme.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('selectedTheme')
  if (savedTheme) {
    selectedTheme.value = savedTheme
    toggleTheme()
  }
})
</script>

<template>
  <v-app>
    <div class="text-center" style="margin: 24px">
      <router-link to="/">
        <img alt="Support.dev" src="@/assets/icon.svg" style="height: 40px" />
      </router-link>
    </div>

    <v-main>
      <RouterViewTransition></RouterViewTransition>
    </v-main>

    <v-footer>
      <v-row justify="center" no-gutters class="py-16">
        <v-col class="text-center" cols="12">
          <span v-for="(link, index) in footerLinks" :key="index">
            <a :href="link.url" target="_blank">
              <v-icon size="x-small">{{ link.icon }}</v-icon>
              {{ link.label }}
              <i-mdi-open-in-new class="pt-2" size="large" />
            </a>
          </span>
        </v-col>

        <v-divider inset class="my-8 mx-16" />

        <v-col class="text-caption text-grey text-center" cols="12">
          Support.dev ™ - &copy; {{ new Date().getFullYear() }}
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style scoped>
a {
  margin: 16px;
  font-size: 14px;
}
</style>
