export interface Request {
  id: number
  stepId: number
  notes?: string
  ranking?: number
  profileId: number
  status: RequestStatusType
  teamId: number
  createdAt?: string
  createdBy?: string
  deletedAt?: string
  deletedBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface RequestUpsert {
  id?: number
  stepId: number
  notes: string
  profileId: number
  status: RequestStatusType
}

export const RequestStatus = {
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  INVITED: 'INVITED',
  TENTATIVE: 'TENTATIVE',
} as const

export type RequestStatusType = typeof RequestStatus[keyof typeof RequestStatus]

export function parseRawRequest(d: any): Request {
  return {
    id: d.id,
    notes: d.notes,
    profileId: d.profile_id,
    ranking: d.ranking,
    status: d.status,
    stepId: d.event_step_id,
    teamId: d.team_id,
    createdAt: d.created_at,
    createdBy: d.created_by,
    deletedAt: d.deleted_at,
    deletedBy: d.deleted_by,
    updatedAt: d.updated_at,
    updatedBy: d.updated_by,
  } as Request
}
