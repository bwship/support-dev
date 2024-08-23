export interface IRelationshipAttributes {
  familyMemberType?: string;
  petType?: string;
  requestTypes?: string[];
  responseTypes?: string[];
}

export interface IRelationshipAttributesRaw {
  family_member_type?: string;
  pet_type?: string;
  request_types?: string[];
  response_types?: string[];
}

export function convertRelationshipAttributesToRaw(attributes?: IRelationshipAttributes): IRelationshipAttributesRaw | undefined {
  const raw: IRelationshipAttributesRaw = {};

  if (!attributes) {
    return undefined;
  }

  if (attributes.familyMemberType) {
    raw.family_member_type = attributes.familyMemberType;
  }
  if (attributes.petType) {
    raw.pet_type = attributes.petType;
  }
  if (attributes.requestTypes && attributes.requestTypes.length > 0) {
    raw.request_types = attributes.requestTypes;
  }
  if (attributes.responseTypes && attributes.responseTypes.length > 0) {
    raw.response_types = attributes.responseTypes;
  }

  return raw;
}




