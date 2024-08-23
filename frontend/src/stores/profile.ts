import { isProfilePending, Profile, parseRawProfile } from '@/models/Profile'
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import { getItemFromCache, setItemToCache } from '@/utils/cacheUtils'

// Define the state interface with strong types
interface ProfileState {
  _authProfile: Profile | null
  _companies: Profile[]
  _profiles: Profile[]
  fetching: boolean
  upserting: boolean
  deactivating: boolean
}

export const useProfile = defineStore({
  id: 'profile-store',

  state: (): ProfileState => ({
    _authProfile: null,
    _companies: [],
    _profiles: [],
    fetching: false,
    upserting: false,
    deactivating: false,
  }),

  getters: {
    companies(state): Profile[] {
      const sortedCompanies = state._companies.sort((a, b) => {
        // If last names are equal, compare first names
        return a.firstName.localeCompare(b.firstName)
      })

      return sortedCompanies
    },

    profile(state): Profile | null {
      return state._authProfile
    },

    isFetching(state): boolean {
      return state.fetching
    },

    isUpserting(state): boolean {
      return state.upserting
    },

    isDeactivating(state): boolean {
      return state.deactivating
    },

    admins: (state) => (teamId: number) => {
      const filteredTeammates = state._profiles?.filter((p) => p.roles.includes('TEAM_ADMIN')) ?? []
      const sortedTeammates = filteredTeammates.sort((a, b) => {
        // Compare last names
        const lastNameComparison = a.lastName.localeCompare(b.lastName)
        if (lastNameComparison !== 0) {
          return lastNameComparison
        }
        // If last names are equal, compare first names
        return a.firstName.localeCompare(b.firstName)
      })

      return sortedTeammates
    },

    clients: (state) => (teamId: number) => {
      const filteredTeammates = state._profiles?.filter((p) => p.roles.includes('CLIENT')) ?? []
      const sortedTeammates = filteredTeammates.sort((a, b) => {
        // Compare last names
        const lastNameComparison = a.lastName.localeCompare(b.lastName)
        if (lastNameComparison !== 0) {
          return lastNameComparison
        }
        // If last names are equal, compare first names
        return a.firstName.localeCompare(b.firstName)
      })

      return sortedTeammates
    },

    dependents:
      (state) =>
      (includePatient = false) => {
        const filteredDependents = state._profiles?.filter(
          (p) => p.roles.includes('FAMILY_MEMBER') || (includePatient && p.roles.includes('CLIENT'))
        )
        const dependents = filteredDependents
          .filter((p) => isProfilePending(p))
          .sort((a, b) => {
            // Compare last names
            const lastNameComparison = a.lastName.localeCompare(b.lastName)
            if (lastNameComparison !== 0) {
              return lastNameComparison
            }
            // If last names are equal, compare first names
            return a.firstName.localeCompare(b.firstName)
          })

        return dependents
      },

    pendingTeammates: (state) => () => {
      const filteredTeammates =
        state._profiles?.filter((p) => p.roles.includes('HELPER') || p.roles.includes('TEAM_ADMIN')) ?? []
      const pendingTeammates = filteredTeammates
        .filter((p) => isProfilePending(p))
        .sort((a, b) => {
          // Compare last names
          const lastNameComparison = a.lastName.localeCompare(b.lastName)
          if (lastNameComparison !== 0) {
            return lastNameComparison
          }
          // If last names are equal, compare first names
          return a.firstName.localeCompare(b.firstName)
        })

      return pendingTeammates
    },

    getProfileById: (state) => (profileId: number) => {
      return state._profiles?.find((p) => p.id == profileId)
    },

    helpers: (state) => () => {
      const filteredTeammates =
        state._profiles?.filter((p) => p.roles.includes('HELPER') && !p.roles.includes('TEAM_ADMIN')) ?? []
      const sortedTeammates = filteredTeammates.sort((a, b) => {
        // Compare last names
        const lastNameComparison = a.lastName?.localeCompare(b.lastName || '')
        if (lastNameComparison !== 0) {
          return lastNameComparison
        }
        // If last names are equal, compare first names
        return a.firstName.localeCompare(b.firstName)
      })

      return sortedTeammates
    },

    teammates: (state) => () => {
      return state._profiles || []
    },
  },

  actions: {
    async deactivate(id: number): Promise<void> {
      this.deactivating = true

      try {
        const { error } = await supabase.rpc('fn_relationship_deactivate', {
          _profile_id: id,
        })

        if (error) {
          throw error
        }

        this._profiles = this._profiles.filter((p) => p.id != id)
        setItemToCache('teammates', this._profiles)
      } catch (err) {
        console.error('Error deleting an address:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.deactivating = false
      }
    },

    async fetchCompanies(useCache = true): Promise<void> {
      this.fetching = true

      try {
        const cached = getItemFromCache('companies', useCache)

        if (cached?.length) {
          this._companies = cached
        } else {
          const { data, error } = await supabase.from('vw_profile').select().contains('roles', ['COMPANY'])

          if (error) {
            throw error
          }

          if (data) {
            this._companies = data.map((d) => parseRawProfile(d))
            setItemToCache('companies', this._companies)
          }
        }
      } catch (err) {
        console.error('Error loading companies:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.fetching = false
      }
    },

    async fetchProfile(userId: string, useCache = true): Promise<void> {
      this.fetching = true

      try {
        const cached = getItemFromCache(`profile-${userId}`, useCache)

        if (cached) {
          this._authProfile = cached
        } else {
          const { data, error } = await supabase
            .from('vw_profile_team')
            .select()
            .eq('user_id', userId)
            .limit(1)
            .single()

          if (error) {
            throw error
          }

          const profile = parseRawProfile(data)

          this._authProfile = profile

          setItemToCache(`profile-${userId}`, profile)
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.fetching = false
      }
    },

    async fetchTeammates(teamId: number, useCache = true): Promise<void> {
      this.fetching = true

      try {
        const cached = getItemFromCache(`teammates-${teamId}`, useCache)

        if (cached?.length) {
          this._profiles = cached
        } else {
          const { data, error } = await supabase
            .from('vw_profile_team')
            .select()
            .eq('team_id', teamId)
            .eq('is_active', true)

          if (error) {
            throw error
          }

          if (data) {
            this._profiles = data.map((d) => parseRawProfile(d))
            setItemToCache(`teammates-${teamId}`, this._profiles)
          }
        }
      } catch (err) {
        console.error('Error loading teammates:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.fetching = false
      }
    },

    async inviteHelper(profile: Profile): Promise<void> {
      this.upserting = true

      try {
        const { error } = await supabase.functions.invoke('users', {
          body: profile,
        })

        await this.fetchTeammates(profile.teamId as number, false)

        if (error) {
          throw error
        }
      } catch (err) {
        console.error('Error inviting a helper:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.upserting = false
      }
    },

    async resendInvite(profile: Profile): Promise<void> {
      this.upserting = true

      try {
        const { error } = await supabase.functions.invoke(`users/${profile.userId}/resend-invite`, {
          method: 'PUT',
          body: profile,
        })

        if (error) {
          throw error
        }
      } catch (err) {
        console.error('Error resending invite to helper:', err)
        throw err
      } finally {
        this.upserting = false
      }
    },

    async upsert(profile: Profile): Promise<void> {
      this.upserting = true

      try {
        let relationshipAttributes = {}
        let profileAttributes = {}

        if (profile.relationshipAttributes) {
          relationshipAttributes = {
            family_member_type: profile.relationshipAttributes.familyMemberType,
            pet_type: profile.relationshipAttributes.petType,
            request_types: profile.relationshipAttributes.requestTypes,
            response_types: profile.relationshipAttributes.responseTypes,
          }
        }

        if (profile.attributes) {
          profileAttributes = {
            date_of_birth: profile.attributes.dateOfBirth,
            disability_accommodations_description: profile.attributes.disabilityAccommodationsDescription,
            food_allergy_description: profile.attributes.foodAllergyDescription,
            food_preferences_description: profile.attributes.foodPreferencesDescription,
            language: profile.attributes.language,
            receive_email_messages: profile.attributes.receiveEmailMessages,
            receive_push_messages: profile.attributes.receivePushMessages,
            receive_sms_messages: profile.attributes.receiveSmsMessages,
            transportation_rules: profile.attributes.transportationRules,
            theme: profile.attributes.theme,
            website: profile.attributes.website,
          }
        }

        const { error } = await supabase.rpc('fn_profile_and_relationship_upsert', {
          _first_name: profile.firstName,
          _id: profile.id,
          _last_name: profile.lastName,
          _parent_profile_id: profile.parentProfileId,
          _profile_attributes: profileAttributes,
          _profile_url: profile.profileUrl,
          _relationship_attributes: relationshipAttributes,
          _roles: profile.roles,
          _team_id: profile.teamId,
          _user_id: profile.userId,
        })

        if (error) {
          throw error
        }
      } catch (err) {
        console.error('Error upserting a dependent:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.upserting = false
      }
    },
  },
})
