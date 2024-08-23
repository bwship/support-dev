import axios from 'axios'
import { Address, LatLng } from '@/models'

export function convertAddressToText(address: Address | undefined, addressPrefix = '') {
  return address
    ? addressPrefix +
        (address.streetAddress1 ? address.streetAddress1 + ', ' : '') +
        (address.streetAddress2 ? address.streetAddress2 + ', ' : '') +
        (address.city ? address.city + ', ' : '') +
        (address.state ? address.state + ', ' : '') +
        (address.zip ? address.zip : '')
    : ''
}

export async function getGeolocation(addressText: string): Promise<LatLng | null> {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: addressText,
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      },
    })
    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location
      return location as LatLng
    } else {
      throw response.data.status
    }
  } catch (error) {
    console.error('Error getting geocoding:', error)
  }

  return null
}

export const states = [
  { title: 'Alabama', abbreviation: 'AL' },
  { title: 'Alaska', abbreviation: 'AK' },
  { title: 'Arizona', abbreviation: 'AZ' },
  { title: 'Arkansas', abbreviation: 'AR' },
  { title: 'California', abbreviation: 'CA' },
  { title: 'Colorado', abbreviation: 'CO' },
  { title: 'Connecticut', abbreviation: 'CT' },
  { title: 'Delaware', abbreviation: 'DE' },
  { title: 'Florida', abbreviation: 'FL' },
  { title: 'Georgia', abbreviation: 'GA' },
  { title: 'Hawaii', abbreviation: 'HI' },
  { title: 'Idaho', abbreviation: 'ID' },
  { title: 'Illinois', abbreviation: 'IL' },
  { title: 'Indiana', abbreviation: 'IN' },
  { title: 'Iowa', abbreviation: 'IA' },
  { title: 'Kansas', abbreviation: 'KS' },
  { title: 'Kentucky', abbreviation: 'KY' },
  { title: 'Louisiana', abbreviation: 'LA' },
  { title: 'Maine', abbreviation: 'ME' },
  { title: 'Maryland', abbreviation: 'MD' },
  { title: 'Massachusetts', abbreviation: 'MA' },
  { title: 'Michigan', abbreviation: 'MI' },
  { title: 'Minnesota', abbreviation: 'MN' },
  { title: 'Mississippi', abbreviation: 'MS' },
  { title: 'Missouri', abbreviation: 'MO' },
  { title: 'Montana', abbreviation: 'MT' },
  { title: 'Nebraska', abbreviation: 'NE' },
  { title: 'Nevada', abbreviation: 'NV' },
  { title: 'New Hampshire', abbreviation: 'NH' },
  { title: 'New Jersey', abbreviation: 'NJ' },
  { title: 'New Mexico', abbreviation: 'NM' },
  { title: 'New York', abbreviation: 'NY' },
  { title: 'North Carolina', abbreviation: 'NC' },
  { title: 'North Dakota', abbreviation: 'ND' },
  { title: 'Ohio', abbreviation: 'OH' },
  { title: 'Oklahoma', abbreviation: 'OK' },
  { title: 'Oregon', abbreviation: 'OR' },
  { title: 'Pennsylvania', abbreviation: 'PA' },
  { title: 'Rhode Island', abbreviation: 'RI' },
  { title: 'South Carolina', abbreviation: 'SC' },
  { title: 'South Dakota', abbreviation: 'SD' },
  { title: 'Tennessee', abbreviation: 'TN' },
  { title: 'Texas', abbreviation: 'TX' },
  { title: 'Utah', abbreviation: 'UT' },
  { title: 'Vermont', abbreviation: 'VT' },
  { title: 'Virginia', abbreviation: 'VA' },
  { title: 'Washington', abbreviation: 'WA' },
  { title: 'West Virginia', abbreviation: 'WV' },
  { title: 'Wisconsin', abbreviation: 'WI' },
  { title: 'Wyoming', abbreviation: 'WY' },
]
