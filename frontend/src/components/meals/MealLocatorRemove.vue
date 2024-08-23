<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMeal } from '@/stores/meal'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import useToasts from '@/composables/useToasts'

const emit = defineEmits<{
  (e: 'cancel', id?: number): void
  (e: 'remove', id?: number): void
}>()

const { addToast } = useToasts()

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const mealStore = useMeal()
const { t } = useI18n()

const isRemoving = ref(false)
const showDialog = ref(false)

const removeClicked = async () => {
  isRemoving.value = true

  try {
    await mealStore.deactivate(id)
    addToast({ text: t('Meal removed successfully'), variant: 'success' })

    emit('cancel', id)
    showDialog.value = false

    router.push({ name: 'meals' })
  } catch (error: any) {
    // Handle the error, if needed
    console.error('Deleting meal failed:', error.message)
    addToast({ text: error.message || error, variant: 'error' })
  } finally {
    isRemoving.value = false
  }
}

onMounted(async () => {})
</script>

<template>
  <v-dialog v-model="showDialog" width="500" persistent>
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="text" color="error" @click="showDialog = true">
        <i-mdi-trash-can />
        {{ $t('Remove') }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <i-mdi-trash-can />
        {{ $t('Remove Dependent') }}
      </v-card-title>
      <v-divider />
      <v-card-text>{{ $t('Are you sure want to remove this meal?') }} </v-card-text>

      <v-divider />
      <v-card-actions class="pr-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn :text="$t('No')" :disabled="isRemoving" @click="showDialog = false"></v-btn>
        <v-btn
          :text="$t('Yes, remove')"
          variant="elevated"
          color="error"
          :loading="isRemoving"
          @click="removeClicked"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
