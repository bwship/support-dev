export interface IEvent {
  id: number;
  description?: string;
  isActive: boolean;
  name: string;
  teamId: number;
  startDate?: string;
  createdAt: string;
  createdBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}
