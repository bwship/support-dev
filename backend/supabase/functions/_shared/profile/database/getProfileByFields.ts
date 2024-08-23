import { IProfile } from '../index.ts';
import { debug } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';

/**
 * @description gets a profile by one of it's fields
 * @param fields
 * @returns a profile record IProfile
 */
export async function getProfileByFields(fields: Record<string, number | string | boolean>): Promise<IProfile> {
  debug('profileService.getProfileByFields', { fields });

  const { data, error } = await supabaseClient
    .from('vw_profile_team')
    .select()
    .match(fields)
    .limit(1)
    .single();

  return convertObjectKeysToCamelCase(data) as IProfile;
}
