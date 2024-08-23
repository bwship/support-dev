import { EventStatusType } from './EventStatus.ts';

export interface IRequest {
    id: number;
    stepId: number;
    profileId: number;
    status: EventStatusType;
    createdAt: Date;
    createdBy: string;
    deletedAt?: Date;
    deletedBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    ranking?: number;
  }
  