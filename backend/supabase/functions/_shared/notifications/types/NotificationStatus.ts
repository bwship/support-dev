export const NotificationStatus = {
    FAILED: 'FAILED',
    PENDING: 'PENDING',
    SENT: 'SENT',
  } as const;
  
  export type NotificationStatusType = typeof NotificationStatus[keyof typeof NotificationStatus];
  