import { NotificationChannelType } from './NotificationChannel.ts';
import { NotificationStatusType } from './NotificationStatus.ts';

export interface INotification {
    id: number;
    profileId: number;
    preHeader?: string;
    subject?: string;
    content: string;
    status: NotificationStatusType;
    channel: NotificationChannelType;
    createdAt: string;
    createdBy?: string;
    sentAt?: string;
    sentBy?: string;
    traceback: string;
  }
  