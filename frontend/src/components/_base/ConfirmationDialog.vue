<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  icon: {
    type: String,
    default: 'mdi-help',
  },
  title: {
    type: String,
    default: 'Confirm',
  },
  text: {
    type: String,
    default: 'Are you sure?',
  },
  yesColor: {
    type: String,
    default: 'primary',
  },
  yesText: {
    type: String,
    default: 'Yes',
  },
  noText: {
    type: String,
    default: 'No',
  },
  value: Boolean,
})

const emits = defineEmits(['update:modelValue', 'answer'])

const dialog = ref(props.value)

watch(
  () => props.value,
  (newVal) => {
    dialog.value = newVal
  }
)

watch(dialog, (newVal) => {
  emits('update:modelValue', newVal)
})

const handleAnswer = (answer: boolean) => {
  emits('answer', answer)
  dialog.value = false
}
</script>

<template>
  <v-dialog v-model="dialog" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon>{{ icon }}</v-icon>
        {{ $t(title) }}
      </v-card-title>
      <v-divider />

      <v-card-text>{{ $t(text) }}</v-card-text>

      <v-divider />
      <v-card-actions class="pr-4 pb-4">
        <v-spacer></v-spacer>

        <v-btn text @click="handleAnswer(false)"> {{ $t(noText) }} </v-btn>
        <v-btn :color="yesColor" variant="elevated" text @click="handleAnswer(true)"> {{ $t(yesText) }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
