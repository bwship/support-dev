import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import { getItemFromCache, setItemToCache } from '@/utils/cacheUtils'

interface IdDescriptionModel {
  id: string
  description?: string
}

interface RoleModel {
  role: string
}

interface EnumStoreState {
  _addressTypes: IdDescriptionModel[]
  _familyMemberTypes: IdDescriptionModel[]
  _inviteStatuses: IdDescriptionModel[]
  _mealTypes: IdDescriptionModel[]
  _mealDeliveryMethods: IdDescriptionModel[]
  _petTypes: IdDescriptionModel[]
  _roles: RoleModel[]
  _stepTypes: IdDescriptionModel[]
  _transportationRules: IdDescriptionModel[]
}

export const useEnum = defineStore({
  id: 'enum-store',

  state: (): EnumStoreState => ({
    _addressTypes: [],
    _familyMemberTypes: [],
    _inviteStatuses: [],
    _mealTypes: [],
    _mealDeliveryMethods: [],
    _petTypes: [],
    _roles: [],
    _stepTypes: [],
    _transportationRules: [],
  }),

  getters: {
    addressTypes(state): IdDescriptionModel[] {
      return state._addressTypes
    },

    familyMemberTypes(state): IdDescriptionModel[] {
      return state._familyMemberTypes
    },

    inviteStatuses(state): IdDescriptionModel[] {
      return state._inviteStatuses
    },

    mealTypes(state): IdDescriptionModel[] {
      return state._mealTypes
    },

    mealDeliveryMethods(state): IdDescriptionModel[] {
      return state._mealDeliveryMethods
    },

    petTypes(state): IdDescriptionModel[] {
      return state._petTypes
    },

    roles(state): RoleModel[] {
      return state._roles
    },

    stepTypes(state): IdDescriptionModel[] {
      return state._stepTypes
    },

    transportationRules(state): IdDescriptionModel[] {
      return state._transportationRules
    },
  },

  actions: {
    async fetch(useCache: boolean, cacheKey: string, tableName: string) {
      try {
        const cached = getItemFromCache(cacheKey, useCache)

        if (cached) {
          return cached
        } else {
          const { data, error } = await supabase.from(tableName).select()

          if (error) {
            throw error
          }

          if (data) {
            let response = null

            response = data.map((d) => ({
              id: d.id,
              description: d.description,
            }))

            setItemToCache(cacheKey, response)
            return response
          }
          return []
        }
      } catch (err) {
        console.error('Error fetching:', err)
        throw err
      }
    },

    async fetchAddressTypes(useCache = true): Promise<void> {
      this._addressTypes = await this.fetch(useCache, 'address-types', 'vw_lookup_address_type')
    },

    async fetchFamilyMemberTypes(useCache = true): Promise<void> {
      this._familyMemberTypes = await this.fetch(useCache, 'family-member-types', 'vw_lookup_family_member_type')
    },

    async fetchInviteStatuses(useCache = true): Promise<void> {
      this._inviteStatuses = await this.fetch(useCache, 'invite-status', 'vw_lookup_invite_status')
    },

    async fetchMealTypes(useCache = true): Promise<void> {
      try {
        const cached = getItemFromCache('meal-types', useCache)

        if (cached) {
          this._mealTypes = cached
        } else {
          const { data, error } = await supabase.from('vw_lookup_meal_type').select()

          if (error) {
            throw error
          }

          if (data) {
            let response = null

            response = data.map((d) => ({
              id: d.meal_type,
              description: d.meal_type,
            }))

            setItemToCache('meal-types', response)

            this._mealTypes = response
          }
        }
      } catch (err) {
        console.error('Error fetching:', err)
        throw err
      }
    },

    async fetchMealDeliveryMethods(useCache = true): Promise<void> {
      try {
        const cached = getItemFromCache('meal-delivery-methods', useCache)

        if (cached) {
          this._mealDeliveryMethods = cached
        } else {
          const { data, error } = await supabase.from('vw_lookup_meal_delivery_method').select()

          if (error) {
            throw error
          }

          if (data) {
            let response = null

            response = data.map((d) => ({
              id: d.meal_delivery_method,
              description: d.meal_delivery_method,
            }))

            setItemToCache('meal-delivery-methods', response)
            this._mealDeliveryMethods = response
          }
        }
      } catch (err) {
        console.error('Error fetching:', err)
        throw err
      }
    },

    async fetchPetTypes(useCache = true): Promise<void> {
      this._petTypes = await this.fetch(useCache, 'pet-types', 'vw_lookup_pet_type')
    },

    async fetchRoles(useCache = true): Promise<RoleModel[]> {
      try {
        const cached = getItemFromCache('roles', useCache)

        if (cached) {
          return cached
        } else {
          const { data, error } = await supabase.from('vw_lookup_role').select()

          if (error) {
            throw error
          }

          if (data) {
            let response = null

            response = data.map((d) => ({
              role: d.role,
            }))

            setItemToCache('roles', response)
            return response
          }

          return []
        }
      } catch (err) {
        console.error('Error fetching:', err)
        throw err
      }
    },

    async fetchStepTypes(useCache = true): Promise<void> {
      this._stepTypes = await this.fetch(useCache, 'step-types', 'vw_lookup_step_type')
    },

    async fetchTransportationRules(useCache = true): Promise<void> {
      this._transportationRules = await this.fetch(useCache, 'transportation-rules', 'vw_lookup_transportation_rule')
    },
  },
})
