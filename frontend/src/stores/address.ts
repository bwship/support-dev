import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import { Address, parseRawAddress } from '@/models'
import { convertAddressToText, getGeolocation, states } from '@/utils/addressUtils'
import { Loader } from '@googlemaps/js-api-loader'
import { getItemFromCache, setItemToCache } from '@/utils/cacheUtils'
import { useProfile } from '@/stores/profile'

// Define the state interface with strong types
interface AddressState {
  _addresses: Address[]
  _addressesByCompany: Address[]
  _loader: Loader | null
  states: Record<string, { title: string; abbreviation: string }[]> // Country -> List of states
  fetching: boolean
  deactivating: boolean
  upserting: boolean
}

export const useAddress = defineStore({
  id: 'address-store',

  state: (): AddressState => ({
    _addresses: [],
    _addressesByCompany: [],
    _loader: null,
    fetching: false,
    deactivating: false,
    upserting: false,
    states: {
      USA: states,
    },
  }),

  getters: {
    addresses(state): Address[] {
      return state._addresses
    },

    addressesByCommpany(state): Address[] {
      return state._addressesByCompany
    },

    getAddressById: (state) => (id: number) => {
      return state._addresses?.find((a) => a.id === id)
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
    async initialize() {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

      if (typeof apiKey === 'string') {
        this._loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places'],
        })

        this._loader.importLibrary('places').catch((e: any) => console.error('Error loading Google Maps:', e))
      }
    },

    async deactivate(id: number): Promise<void> {
      this.deactivating = true

      try {
        const { error } = await supabase.rpc('fn_address_deactivate', {
          _id: id,
        })

        if (error) {
          throw error
        }

        // remove from local cache
        this._addresses = this._addresses.filter((a) => a.id != id)
        setItemToCache('addresses', this._addresses)
      } catch (err) {
        console.error('Error deleting an address:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.deactivating = false
      }
    },

    async fetchAddresses(teamId: number, useCache = true): Promise<void> {
      this.fetching = true

      try {
        const cached = getItemFromCache('addresses', useCache)

        if (cached?.length) {
          // If cached teammates are available, use them
          this._addresses = cached
        } else {
          const { data, error } = await supabase.from('vw_address').select().eq('team_id', teamId).eq('is_active', true)

          if (error) {
            throw error
          }

          if (data) {
            this._addresses = await Promise.all(
              data.map(async (d) => {
                const address = parseRawAddress(d)

                // Parse the POINT type location into an object with lat and lng
                let location

                if (d.location) {
                  const [x, y] = d.location.replace(/[()]/g, '').split(',').map(Number)
                  location = { lat: x, lng: y }
                  address.location = location
                } else {
                  const addressText = convertAddressToText(address)
                  location = await getGeolocation(addressText)

                  if (location) {
                    address.location = location

                    // if this address is for the current user, then update the location in the database
                    const profileStore = useProfile()
                    if (address.profileId === profileStore.profile?.id) {
                      await this.upsert(address)
                    }
                  }
                }

                return address
              })
            )
          }

          // Cache the addresses data in localStorage
          setItemToCache('addresses', this._addresses)
        }
      } catch (err) {
        console.error('Error loading addresses:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.fetching = false
      }
    },

    async fetchAddressesByCompany(companyId: number, useCache = true): Promise<void> {
      this.fetching = true
      this._addressesByCompany = []

      try {
        const { data, error } = await supabase
          .from('vw_address')
          .select()
          .eq('profile_id', companyId)
          .eq('is_active', true)

        if (error) {
          throw error
        }

        if (data) {
          this._addressesByCompany = await Promise.all(
            data.map(async (d) => {
              const address = parseRawAddress(d)

              // Parse the POINT type location into an object with lat and lng
              let location

              if (d.location) {
                const [x, y] = d.location.replace(/[()]/g, '').split(',').map(Number)
                location = { lat: x, lng: y }
                address.location = location
              } else {
                const addressText = convertAddressToText(address)
                location = await getGeolocation(addressText)

                if (location) {
                  address.location = location
                }
              }

              return address
            })
          )
        }
      } catch (err) {
        console.error('Error loading addresses:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.fetching = false
      }
    },

    async upsert(address: Address): Promise<void> {
      this.upserting = true

      try {
        if (!address.location) {
          const location = await getGeolocation(convertAddressToText(address))
          if (location) address.location = location
        }

        const { error } = await supabase.rpc('fn_address_upsert', {
          _city: address.city,
          _description: address.description,
          _id: address.id,
          _location: address.location ? `(${address.location.lat}, ${address.location.lng})` : null,
          _profile_id: address.profileId,
          _state: address.state,
          _street_address_1: address.streetAddress1,
          _street_address_2: address.streetAddress2,
          _type: address.type.toUpperCase(),
          _zip: address.zip,
        })

        if (error) {
          throw error
        }
      } catch (err) {
        console.error('Error upserting an address:', err)
        throw err // Rethrow the error to handle it in the calling code
      } finally {
        this.upserting = false
      }
    },
  },
})
