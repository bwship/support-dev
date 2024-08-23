import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';

export async function upsertEvent(
    name: string,
    description: string,
    startDate: string,
    teamId: number,
): Promise<number> {
  debug('event.database.upsertEvent', { name, description, startDate, teamId });
  
  const res = await supabaseClient.rpc('fn_event_upsert', {
    _name: name,
    _description: description,
    _start_date: startDate,
    _team_id: teamId,
  });

  if (res.error) {
    error('event.database.upsertEvent - Error upserting event: ', res.error);
    throw res.error;
  }

  return res.data;
}
