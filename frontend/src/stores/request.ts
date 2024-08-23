import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import { RequestUpsert } from '@/models/Request'

interface RequestStoreState {
  _updating: boolean
}

export const useRequest = defineStore({
  id: 'request-store',

  state: (): RequestStoreState => ({
    _updating: false,
  }),

  getters: {},

  actions: {
    async upsertRequest(request: RequestUpsert): Promise<boolean> {
      this._updating = true
      try {
        const { error } = await supabase.rpc('fn_event_step_request_upsert', {
          ...(request.id && { _id: request.id }),
          _event_step_id: request.stepId,
          _notes: request.notes,
          _profile_id: request.profileId,
          _status: request.status,
        })

        if (error) {
          throw error
        }
        return true
      } catch (err) {
        console.error('Error upserting an event step request:', err)
        throw err
      } finally {
        this._updating = false
      }
    },
  },
})
