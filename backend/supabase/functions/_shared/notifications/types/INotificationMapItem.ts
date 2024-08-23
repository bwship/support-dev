import { IEvent, IStep } from '../../event/types/index.ts';
import { IProfile } from '../../profile/index.ts';
import { NotificationPurposeType } from './NotificationPurpose.ts';

export interface INotificationMapItem {
  purpose: NotificationPurposeType,
  event: IEvent,
  step: IStep,
  requestId: number
  clientProfile: IProfile,
  helperProfile: IProfile,
}
