import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';


export async function processUpcomingEvents(  
): Promise<boolean> {
  debug('event.database.processUpcomingEvents');
  
  const res = await supabaseClient
    .rpc('fn_events_process_upcoming');
  
  if (res.error) {
    error('event.database.processUpcomingEvents - Failed to call fn_process_upcoming_events:', res.error);    
    throw res.error;
  }

  return true;
}
