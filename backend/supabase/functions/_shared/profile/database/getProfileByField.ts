import { IProfile } from '../index.ts';
import { debug, error as logError } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';

/**
 * @description gets a profile by one of it's fields
 * @param field
 * @param value
 * @returns a profile record IProfile
 */
export async function getProfileByField(field: string, value: number | string): Promise<IProfile> {
  debug('profileService.getProfileByField', { field, value });
  
  const { data, error } = await supabaseClient
    .from('vw_profile_team')
    .select()
    .eq(field, value)
    .limit(1)
    .single();

  if (error) {
    logError('error retrieving profile', { error })
  }

  return convertObjectKeysToCamelCase(data) as IProfile;
}
