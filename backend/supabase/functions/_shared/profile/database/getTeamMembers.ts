import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { IProfile } from '../index.ts';

/**
 * @description get team members for a client
 * @param teamId - id of team to retrieve members for
 * @returns an array of team members IProfile[]
 */
export async function getTeamMembers(teamId: number): Promise<IProfile[]> {
  debug('team.getTeamMembers', { teamId });

  const res = await supabaseClient
    .from('vw_profile_team')
    .select()
    .eq('team_id', teamId);

  return convertObjectKeysToCamelCase(res.data) as IProfile[];
}
