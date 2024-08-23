export interface LatLng {
  lat: number
  lng: number
}

export interface Address {
  id?: number
  city: string
  description?: string
  isActive?: boolean
  location?: LatLng
  profileId: number
  state: string
  streetAddress1: string
  streetAddress2?: string
  teamId?: number
  type: string
  zip: string
}

export function parseRawAddress(data: any): Address {
  const address: Address = {
    id: data.id,
    city: data.city,
    description: data.description,
    isActive: data.is_active,
    profileId: data.profile_id,
    state: data.state,
    streetAddress1: data.street_address_1,
    streetAddress2: data.street_address_2,
    teamId: data.team_id,
    type: data.type,
    zip: data.zip,
  }

  // Parse the POINT type location into an object with lat and lng
  if (data.location) {
    const [x, y] = data.location.replace(/[()]/g, '').split(',').map(Number)
    const location = { lat: x, lng: y }
    address.location = location
  }

  return address
}
