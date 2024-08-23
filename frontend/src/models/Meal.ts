import { Address, parseRawAddress } from './Address'
import { Profile, parseRawProfile } from './Profile'

export interface MealAttributes {
  data: string
}

export interface Meal {
  id: number
  profileId: number
  addressId: number
  profile: Profile
  address: Address
  attributes?: MealAttributes
  description?: string
  workingDays?: string
  workingHours?: string
  requiresEligibility?: boolean
  eligibilityRules?: string
  mealTypes?: string[]
  mealDeliveryMethods?: string[]
  isActive?: boolean
  createdAt?: string
  createdBy?: string
  deletedAt?: string
  deletedBy?: string
  updatedAt?: string
  updatedBy?: string
}

export function parseRawMeal(data: any): Meal {
  return {
    id: data.id,
    profileId: data.profile_id,
    addressId: data.address_id,
    profile: parseRawProfile(data.profile),
    address: parseRawAddress(data.address),
    attributes: {
      data: '',
    },
    description: data.description,
    workingDays: data.working_days,
    workingHours: data.working_hours,
    requiresEligibility: data.requires_eligibility,
    eligibilityRules: data.eligibility_rules,
    mealTypes: data.meal_type,
    mealDeliveryMethods: data.meal_delivery_method,
    isActive: data.is_active,
    createdAt: data.created_at,
    createdBy: data.created_by,
    deletedAt: data.deleted_at,
    deletedBy: data.deleted_by,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by,
  }
}
