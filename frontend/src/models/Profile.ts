export const Role = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  COMPANY: 'COMPANY',
  FAMILY_MEMBER: 'FAMILY_MEMBER',
  HELPER: 'HELPER',
  TEAM_ADMIN: 'TEAM_ADMIN',
  TEAM_OWNER: 'TEAM_OWNER',
} as const

export type RoleType = typeof Role[keyof typeof Role]

export interface IProfileAttributes {
  dateOfBirth?: string
  disabilityAccommodationsDescription?: string
  foodAllergyDescription?: string
  foodPreferencesDescription?: string
  language?: string
  receiveEmailMessages?: boolean
  receivePushMessages?: boolean
  receiveSmsMessages?: boolean
  theme?: string
  transportationRules?: string[]
  website?: string
}

export interface IRelationshipAttributes {
  familyMemberType?: string
  petType?: string
  requestTypes?: string[]
  responseTypes?: string[]
}

export interface Profile {
  id?: number
  attributes: IProfileAttributes
  email?: string
  firstName: string
  isActive?: boolean
  isEmailPending?: boolean
  isPhonePending?: boolean
  lastName?: string
  phoneNumber?: string
  profileUrl?: string
  relationshipAttributes?: IRelationshipAttributes
  roles: RoleType[]
  teamId?: number
  teamName?: string
  userId?: string
  parentProfileId?: number
}

export function isProfilePending(profile: Profile): boolean {
  if (profile.isEmailPending && profile.isPhonePending) {
    return true
  }

  if (!profile.relationshipAttributes?.responseTypes || profile.relationshipAttributes.responseTypes?.length === 0) {
    return true
  }

  return false
}

export function parseRawProfile(data: any): Profile {
  return {
    id: data.id,
    attributes: {
      dateOfBirth: data.attributes?.date_of_birth,
      disabilityAccommodationsDescription: data.attributes?.disability_accommodations_description,
      foodAllergyDescription: data.attributes?.food_allergy_description,
      foodPreferencesDescription: data.attributes?.food_preferences_description,
      language: data.attributes?.language || 'en',
      receiveEmailMessages: data.attributes?.receive_email_messages || false,
      receivePushMessages: data.attributes?.receive_push_messages || false,
      receiveSmsMessages: data.attributes?.receive_sms_messages || false,
      theme: data.attributes?.theme || 'darkTheme',
      transportationRules: data.attributes?.transportation_rules,
      website: data.attributes?.website,
    },
    email: data.email,
    firstName: data.first_name,
    isActive: data.is_active,
    isEmailPending: data.is_email_pending,
    isPhonePending: data.is_phone_pending,
    lastName: data.last_name,
    phoneNumber: data.phone,
    profileUrl: data.profile_url,
    relationshipAttributes: {
      familyMemberType: data.relationship_attributes?.family_member_type,
      petType: data.relationship_attributes?.pet_type,
      requestTypes: data.relationship_attributes?.request_types,
      responseTypes: data.relationship_attributes?.response_types,
    },
    roles: data.roles,
    teamId: data.team_id,
    teamName: data.team_name,
    userId: data.user_id,
    parentProfileId: data.parent_profile_id,
  }
}
