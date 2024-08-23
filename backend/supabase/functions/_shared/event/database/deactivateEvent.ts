import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';


export async function deactivateEvent(eventId: number): Promise<boolean> {
  debug('event.database.deactivateEvent', { eventId });

  const res = await supabaseClient
    .rpc('fn_event_deactivate', {
      _event_id: eventId,      
    })

    if (res.error) {
      error(`event.database.deactivateEvent - Failed to deactivate event: ${res.error}`);
      throw res.error;
    }
  
  return true;
}
