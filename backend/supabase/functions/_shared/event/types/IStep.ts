import { StepTypeType } from './StepType.ts';

export interface IMealAttribute {
  addressId?: number;
  familyMemberIds?: number[];
  dropoffAt?: string;
}

export interface ITransportationAttribute {
  startAddressId?: number;
  endAddressId?: number;
  pickupAt?: string;
}

export interface IChildCareAttribute {
  addressId?: number;
  familyMemberIds?: number[];
  startAt?: string;
  endAt?: string;
}

export interface IStep {
  id: number;
  mealAttributes?: IMealAttribute;
  childCareAttributes?: IChildCareAttribute;
  transportationAttributes?: ITransportationAttribute;
  attributes?: IMealAttribute | ITransportationAttribute | IChildCareAttribute;
  eventId: number;
  isActive: boolean;
  notes?: string;
  parentStepId?: number;
  type: StepTypeType;
  createdAt: string;
  createdBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}
