export const NotificationChannel = {
    EMAIL: 'EMAIL',
    PHONE: 'PHONE',
    PUSH: 'PUSH',
    SLACK: 'SLACK',
  } as const;
  
  export type NotificationChannelType = typeof NotificationChannel[keyof typeof NotificationChannel];
  