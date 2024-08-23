import {
  IProfileAttributes,
  IRelationshipAttributes,
  RoleType,
} from './index.ts';
import { UUID } from '../../auth/UUID.ts';

export interface IProfile {
  id: number;
  attributes: IProfileAttributes;
  email?: string;
  firstName: string;
  isActive: boolean;
  lastName: string;
  phoneNumber?: string;
  profileUrl: string;
  relationshipAttributes?: IRelationshipAttributes;
  roles: RoleType[];
  teamId?: number;
  teamName?: string;
  userId: UUID;
  createdAt: Date;
  createdBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}
