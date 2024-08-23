import { Request, RequestStatus } from './Request'

interface ChildCareAttributesModel {
  addressId?: number
  familyMemberIds?: number[]
  startAt?: string
  endAt?: string
}

export class ChildCareAttributes implements ChildCareAttributesModel {
  addressId?: number
  familyMemberIds?: number[]
  startAt?: string
  endAt?: string
}

interface MealAttributesModel {
  addressId?: number
  familyMemberIds?: number[]
  dropoffAt?: string
}

export class MealAttributes implements MealAttributesModel {
  addressId?: number
  familyMemberIds?: number[]
  dropoffAt?: string
}

interface TransportationAttributesModel {
  startAddressId?: number
  endAddressId?: number
  pickupAt?: string
}

export class TransportationAttributes implements TransportationAttributesModel {
  startAddressId?: number
  endAddressId?: number
  pickupAt?: string
}

export interface Step {
  id: number
  childCareAttributes?: ChildCareAttributes
  mealAttributes?: MealAttributes
  transportationAttributes?: TransportationAttributes
  eventId: number
  teamId: number
  startDate: string
  isActive: boolean
  notes: string
  parentStepId?: number
  type: string
  requests: Request[]
  createdAt: string
  createdBy?: string
  deletedAt?: string
  deletedBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface StepUpsert {
  id?: number
  startDate: string
  teamId: number
  type: string
  attributes: ChildCareAttributes | MealAttributes | TransportationAttributes
  notes: string
}

export function acceptedProfileId(step: Step) {
  const request = step.requests?.find((r) => r.status === RequestStatus.ACCEPTED && r.ranking === 1)
  return request?.profileId
}

export function stepIcon(step: Step) {
  switch (step?.type) {
    case 'CHILD_CARE':
      return 'mdi-human-male-boy'
    case 'MEAL':
      return 'mdi-silverware'
    case 'TRANSPORTATION':
      return 'mdi-car'
    default:
      return 'mdi-warning'
  }
}

export function isStepMine(step: Step, profileId: number) {
  return step.requests?.some((r) => r.profileId === profileId)
}

export function isStepAccepted(step?: Step) {
  return step?.requests?.some((r) => r.status === RequestStatus.ACCEPTED)
}

export function isStepPending(step?: Step) {
  return step?.requests?.some((r) => r.status === RequestStatus.INVITED)
}

export function parseRawStep(rawStep: any): Step {
  let transportationAttributes
  let mealAttributes
  let childCareAttributes

  if (rawStep.type === 'TRANSPORTATION' && rawStep.transportation_attributes) {
    transportationAttributes = new TransportationAttributes()
    transportationAttributes.startAddressId = rawStep.transportation_attributes.start_address_id
    transportationAttributes.endAddressId = rawStep.transportation_attributes.end_address_id
    transportationAttributes.pickupAt = rawStep.transportation_attributes.pickup_at
  } else if (rawStep.type === 'MEAL' && rawStep.meal_attributes) {
    mealAttributes = new MealAttributes()
    mealAttributes.addressId = rawStep.meal_attributes.address_id
    mealAttributes.familyMemberIds = rawStep.meal_attributes.family_member_ids
    mealAttributes.dropoffAt = rawStep.meal_attributes.dropoff_at
  } else if (rawStep.type === 'CHILD_CARE' && rawStep.child_care_attributes) {
    childCareAttributes = new ChildCareAttributes()
    childCareAttributes.addressId = rawStep.child_care_attributes.address_id
    childCareAttributes.familyMemberIds = rawStep.child_care_attributes.family_member_ids
    childCareAttributes.startAt = rawStep.child_care_attributes.start_at
    childCareAttributes.endAt = rawStep.child_care_attributes.end_at
  }

  const requests: Request[] = []
  for (const request of rawStep.requests) {
    requests.push({
      id: request.id,
      stepId: rawStep.id,
      notes: '',
      ranking: request.ranking,
      profileId: request.profile_id,
      status: request.status,
    })
  }

  return {
    id: rawStep.id,
    eventId: rawStep.event_id,
    isActive: rawStep.is_active,
    notes: rawStep.notes,
    type: rawStep.type,
    teamId: rawStep.team_id,
    startDate: rawStep.start_date,
    transportationAttributes,
    mealAttributes,
    childCareAttributes,
    requests,
    createdAt: rawStep.created_at,
    createdBy: rawStep.created_by,
    deletedAt: rawStep.deleted_at,
    deletedBy: rawStep.deleted_by,
    updatedAt: rawStep.updated_at,
    updatedBy: rawStep.updated_by,
  } as Step
}
