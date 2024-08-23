export const NotificationPurpose = {
  STEP_REMINDER: 0,
  STEP_ISSUANCE: 1
} as const;

export type NotificationPurposeType = typeof NotificationPurpose[keyof typeof NotificationPurpose];
