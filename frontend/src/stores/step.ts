import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import { Event, Step, StepUpsert, isStepPending, parseRawStep } from '@/models'
import { getItemFromCache, setItemToCache } from '@/utils/cacheUtils'

interface EventState {
  _steps: Step[]
  _fetching: boolean
  _deactivating: boolean
  _inserting: boolean
}

export const useStep = defineStore({
  id: 'step-store',

  state: (): EventState => ({
    _steps: [],
    _fetching: false,
    _deactivating: false,
    _inserting: false,
  }),

  getters: {
    events(state): Event[] {
      const events: Event[] = []

      state._steps.forEach((s) => {
        const { eventId, startDate } = s
        const existingEventIndex = events.findIndex((event) => event.id === eventId)

        if (existingEventIndex === -1) {
          events.push({ id: eventId, startDate })
        }
      })

      return events
    },

    pendingSteps(state): Step[] {
      return state._steps.filter((s) => isStepPending(s))
    },

    steps(state): Step[] {
      return state._steps
    },
  },

  actions: {
    async deactivateStep(stepId: number, teamId: number): Promise<boolean> {
      this._deactivating = true
      try {
        const { error } = await supabase.rpc('fn_event_step_deactivate', {
          _id: stepId,
        })

        if (error) {
          throw error
        }

        this._steps = this._steps.filter((a) => a.id != stepId)
        setItemToCache(`steps-${teamId}`, this._steps)

        return true
      } catch (err) {
        console.error('Error deleting an step:', err)
        throw err
      } finally {
        this._deactivating = false
      }
    },

    async fetchSteps(teamId: number, useCache = true): Promise<void> {
      this._fetching = true

      try {
        const cached = getItemFromCache(`steps-${teamId}`, useCache)

        // Check if there is cache and it is less than an hour old
        if (cached?.length) {
          this._steps = cached
        } else {
          const today = new Date()
          const formattedToday = today.toISOString().split('T')[0] // Format today's date as YYYY-MM-DD

          const { data, error } = await supabase
            .from('vw_event_step')
            .select()
            .eq('team_id', teamId)
            .eq('is_active', true)
            .gte('start_date', formattedToday)

          if (error) {
            throw error
          }

          if (data) {
            this._steps = data.map((d) => {
              return parseRawStep(d)
            })

            setItemToCache(`steps-${teamId}`, this._steps)
          }
        }
      } catch (err) {
        console.error('Error loading steps:', err)
        throw err
      } finally {
        this._fetching = false
      }
    },

    async fetchStep(stepId: number, teamId: number): Promise<void> {
      this._fetching = true

      try {
        const { data, error } = await supabase.from('vw_event_step').select().eq('id', stepId).eq('is_active', true)

        if (error) {
          throw error
        }

        if (data?.length) {
          const step = parseRawStep(data[0])
          const existingStepIndex = this._steps.findIndex((s) => s.id === step.id)

          if (existingStepIndex !== -1) {
            // Update existingStep properties with the properties of step
            Object.assign(this._steps[existingStepIndex], step)

            if (!this._steps[existingStepIndex].isActive) {
              // Remove existingStep from _steps if it's not active
              this._steps.splice(existingStepIndex, 1)
            }
          } else {
            this._steps.push(step)
          }

          setItemToCache(`steps-${teamId}`, this._steps)
        } else {
          this._steps = this._steps.filter((a) => a.id != stepId)
          setItemToCache(`steps-${teamId}`, this._steps)
        }
      } catch (err) {
        console.error('Error loading step:', err)
        throw err
      } finally {
        this._fetching = false
      }
    },

    async upsertStep(step: StepUpsert): Promise<boolean> {
      this._inserting = true

      try {
        const { error } = await supabase.rpc('fn_event_step_upsert', {
          ...(step.id && { _id: step.id }),
          _start_date: step.startDate,
          _team_id: step.teamId,
          _type: step.type,
          _attributes: step.attributes,
          _notes: step.notes,
        })

        if (error) {
          throw error
        }

        return true
      } catch (err) {
        console.error('Error inserting an event:', err)
        throw err
      } finally {
        this._inserting = false
      }
    },
  },
})
