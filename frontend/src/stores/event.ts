import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'

interface EventState {
  cloning: boolean
}

export const useEvent = defineStore({
  id: 'event-store',

  state: (): EventState => ({
    cloning: false,
  }),

  getters: {},

  actions: {
    async clone(eventId: number, newDate: Date): Promise<boolean> {
      this.cloning = true

      try {
        const { error } = await supabase.functions.invoke(`events/${eventId}/clone`, {
          method: 'POST',
          body: {
            new_date: newDate.toISOString().split('T')[0],
          },
        })

        if (error) {
          throw error
        }
      } catch (err) {
        console.error('Error cloning an event:', err)
        throw err
      } finally {
        this.cloning = false
      }

      return true
    },
  },
})
