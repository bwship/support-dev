export const EventProcessingStatus = {
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING: 'PENDING'
} as const;
  
export type EventProcessingStatusType = typeof EventProcessingStatus[keyof typeof EventProcessingStatus];
  