export const EventStatus = {
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  INVITED: 'INVITED',
  TENTATIVE: 'TENTATIVE'
} as const;

export type EventStatusType = typeof EventStatus[keyof typeof EventStatus];
