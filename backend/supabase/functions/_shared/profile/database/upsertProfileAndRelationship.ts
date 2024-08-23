import { debug, error as logError } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import {
  convertProfileAttributesToRaw,
  convertRelationshipAttributesToRaw,
  IProfile,
} from '../index.ts';

/**
 * @description upsert the a profile/relationship/team
 * @param field
 * @param value
 * @returns the id of the profile that is upserted
 */
export async function upsertProfileAndRelationship(profile: IProfile, parentProfileId?: number): Promise<number> {
  debug('profileService.upsertProfileAndRelationship', { profile, parentProfileId });

  const attributes = convertProfileAttributesToRaw(profile.attributes ?? {});
  const relationshipAttributes = convertRelationshipAttributesToRaw(profile.relationshipAttributes ?? {});

  const { data, error } = await supabaseClient
    .rpc('fn_profile_and_relationship_upsert', {
      _user_id: profile.userId,
      _parent_profile_id: parentProfileId,
      _id: profile.id,
      _profile_attributes: attributes,
      _relationship_attributes: relationshipAttributes,
      _first_name: profile.firstName,
      _last_name: profile.lastName,
      _profile_url: undefined,
      _roles: profile.roles,
      _team_id: profile.teamId,
    });

  if (error) {
    logError('error calling fn_profile_and_relationship_upsert', { error });
    throw error;
  }

  return data;
}
