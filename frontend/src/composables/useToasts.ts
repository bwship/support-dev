import { ref, watch, watchEffect } from 'vue'

const DEFAULT_TIMEOUT = 5000

type BSVariant = 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info'

export interface ToastOptions {
  id?: string
  text?: string
  variant?: BSVariant
  timeout?: number
  customHTML?: string
  button?: string
  buttonColor?: string
  show?: boolean
}
export interface Toast extends ToastOptions {
  id: string
  variant: BSVariant
  timeout: number
}

const toasts = ref<Toast[]>([])
const topToast = ref<Toast | null>(null)

export function addToast({
  text,
  variant = 'primary',
  timeout = DEFAULT_TIMEOUT,
  customHTML,
  button = 'Close',
  buttonColor = 'black',
}: ToastOptions) {
  const toast = { id: `toast-${Date.now()}`, text, variant, timeout, customHTML, show: true, button, buttonColor }
  toasts.value.push(toast)
}

watchEffect(() => {
  if (toasts.value.length > 0 && topToast.value != toasts.value[0]) {
    topToast.value = null
    setTimeout(() => {
      topToast.value = toasts.value[0]
    })
  }
})

watch(
  topToast,
  (newValue, oldValue) => {
    toasts.value = toasts.value.filter((t) => t.show)
  },
  { deep: true }
)

export default function useToasts() {
  return { addToast, topToast }
}
