<script setup lang="ts">
import { parseRawRequest } from '@/models/Request'
import { RealtimeChannel } from '@supabase/supabase-js'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import { useProfile } from '@/stores/profile'
import { useStep } from '@/stores/step'

const profileStore = useProfile()
const stepStore = useStep()
let channel: RealtimeChannel | undefined = undefined

const profile = computed(() => {
  return profileStore.profile
})

const teamId = computed(() => {
  return profile.value?.teamId
})

const debounceTimers: { [key: string]: number | null } = {}

const handleInsertRecordChanged = async (e: any) => {
  const request = parseRawRequest(e.new)
  console.log(`handleInsertRecordChanged - ${JSON.stringify(request)}`)

  const { stepId, teamId } = request

  // Check if a debounce timer is already running for this stepId
  if (debounceTimers[stepId] !== undefined && debounceTimers[stepId] !== null) {
    const timeoutId = debounceTimers[stepId]
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }

  // Set up a new debounce timer for this stepId
  debounceTimers[stepId] = window.setTimeout(() => {
    stepStore.fetchStep(stepId, teamId)
    debounceTimers[stepId] = null // Reset debounce timer after execution
  }, 2000)
}

const handleUpdateRecordChanged = async (e: any) => {
  const request = parseRawRequest(e.new)
  console.log(`handleUpdateRecordChanged - ${JSON.stringify(request)}`)

  const { stepId, teamId } = request

  // Check if a debounce timer is already running for this stepId
  if (debounceTimers[stepId] !== undefined && debounceTimers[stepId] !== null) {
    const timeoutId = debounceTimers[stepId]
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }

  // Set up a new debounce timer for this stepId
  debounceTimers[stepId] = window.setTimeout(() => {
    stepStore.fetchStep(stepId, teamId)
    debounceTimers[stepId] = null // Reset debounce timer after execution
  }, 2000)
}

function setupListener() {
  if (channel) {
    supabase.removeChannel(channel)
  }

  channel = supabase.channel('request-room')
  channel?.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'event_step_request',
      filter: `team_id=eq.${teamId.value}`,
    },
    handleInsertRecordChanged
  )

  channel?.on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'event_step_request',
      filter: `team_id=eq.${teamId.value}`,
    },
    handleUpdateRecordChanged
  )

  channel?.subscribe()
}

onMounted(async () => {
  setupListener()
})

onBeforeUnmount(() => {
  if (channel) {
    supabase.removeChannel(channel)
  }
})
</script>

<template></template>
