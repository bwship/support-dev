import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';

interface ISeedProfile {
  id: number;
  userId: string; 
  teamId: number; 
  profileRoles?: string[];
}

export async function getSeedProfile (): Promise<ISeedProfile | null> {
  debug('event.database.getSeedUser');

  const res = await supabaseClient.from('vw_user')
    .select(`vw_profile!profile_user_id_fkey (id, user_id, roles)`)
    .eq('instance_id', '00000000-0000-0000-0000-000000000000')
    .contains('vw_profile.roles', '{"CLIENT"}');

  if (res.error) {
    error('event.getSeedUser - Error getting seed profile:', res.error);
    throw res.error;
  }

  if (!res.data) {
    return null;
  }

  for (const entry of res.data) {
    for (const profile of entry.vw_profile) {
      if (profile.user_id) {
        return convertObjectKeysToCamelCase(profile) as ISeedProfile;
      }
    }
  }
  
  return null;
}
