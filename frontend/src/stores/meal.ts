import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import { Meal, parseRawMeal } from '@/models'
import { Loader } from '@googlemaps/js-api-loader'
import { getItemFromCache, setItemToCache } from '@/utils/cacheUtils'

// Define the state interface with strong types
interface MealState {
  _meals: Meal[]
  _loader: Loader | null
  fetching: boolean
  deactivating: boolean
  upserting: boolean
}

export const useMeal = defineStore({
  id: 'meal-store',

  state: (): MealState => ({
    _meals: [],
    _loader: null,
    fetching: false,
    deactivating: false,
    upserting: false,
  }),

  getters: {
    meals(state): Meal[] {
      return state._meals
    },

    getMealById: (state) => (id: number) => {
      return state._meals?.find((m) => m.id === id)
    },

    isFetching(state): boolean {
      return state.fetching
    },

    isDeactivating(state): boolean {
      return state.deactivating
    },

    isUpserting(state): boolean {
      return state.upserting
    },
  },

  actions: {
    async deactivate(id: number): Promise<void> {
      this.deactivating = true

      try {
        const { error } = await supabase.rpc('fn_meal_information_deactivate', {
          _id: id,
        })

        if (error) {
          throw error
        }

        // remove from local cache
        this._meals = this._meals.filter((a) => a.id != id)
        setItemToCache('meals', this._meals)
      } catch (err) {
        console.error('Error deleting a meal:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.deactivating = false
      }
    },

    async fetchMeals(useCache = true): Promise<void> {
      this.fetching = true

      try {
        const cached = getItemFromCache('meals', useCache)

        if (cached?.length) {
          this._meals = cached
        } else {
          const { data, error } = await supabase.from('vw_meal_information').select()

          if (error) {
            throw error
          }

          if (data) {
            this._meals = data.map((d) => parseRawMeal(d))
            setItemToCache('meals', this._meals)
          }
        }
      } catch (err) {
        console.error('Error loading meals:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.fetching = false
      }
    },

    async upsert(meal: Meal): Promise<void> {
      this.upserting = true

      try {
        const { error } = await supabase.rpc('fn_meal_information_upsert', {
          _profile_id: meal.profileId,
          _address_id: meal.addressId,
          _attributes: meal.attributes,
          _description: meal.description,
          _working_days: meal.workingDays,
          _working_hours: meal.workingHours,
          _requires_eligibility: meal.requiresEligibility,
          _eligibility_rules: meal.eligibilityRules,
          _meal_type: meal.mealTypes,
          _meal_delivery_method: meal.mealDeliveryMethods,
          _id: meal.id,
        })

        if (error) {
          throw error
        }
      } catch (err) {
        console.error('Error upserting a meal:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.upserting = false
      }
    },
  },
})
