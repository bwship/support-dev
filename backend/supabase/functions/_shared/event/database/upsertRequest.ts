import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { EventStatusType } from '../types/EventStatus.ts';


export async function upsertRequest(
  event_step_id: number,
  notes: string,
  profile_id: number,
  status: EventStatusType,  
  id?: number
  ): Promise<number> {
  debug('event.database.upsertRequest', { event_step_id, notes, profile_id, status, id });

  const res = await supabaseClient
    .rpc('fn_event_step_request_upsert', {
      _event_step_id: event_step_id ,
      _notes: notes,
      _profile_id: profile_id,
      _status: status,
      ...(id ? {_id: id} : {})
    });

  if (res.error) {
    error('event.database.upsertRequest - Error upserting step request: ', res.error);
    throw res.error;
  }

  return res.data as number;
}
