import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { EventProcessingStatusType } from '../index.ts';


export async function updateEventProcessingById(eventProcessingId: number, status: EventProcessingStatusType): Promise<boolean> {
  debug('event.database.updateEventProcessingById', { eventProcessingId });

  const res = await supabaseClient
    .from('event_processing')
    .update({'status': status})
    .eq('id', eventProcessingId);    

  if (res.error) {
    error('event.database.updateEventProcessingById - Error updating event processing by event id:', res.error);
    throw res.error;
  }

  return true;
}
