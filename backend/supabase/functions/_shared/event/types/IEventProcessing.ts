import { EventProcessingStatusType } from './EventProcessingStatus.ts';

export interface IEventProcessing {
  id: number;
  eventId: number;
  status: EventProcessingStatusType;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
}
