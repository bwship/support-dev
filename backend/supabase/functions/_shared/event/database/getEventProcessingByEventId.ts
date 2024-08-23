import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import { IEventProcessing } from '../types/IEventProcessing.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';


export async function getEventProcessingByEventId(eventId: number): Promise<IEventProcessing | undefined> {
  debug('event.database.getEventProcessingByEventId', { eventId });

  const res = await supabaseClient
    .from('event_processing')
    .select()
    .eq('event_id', eventId)
    .eq('status', 'PENDING')
    .limit(1)
    .single();

  if (res.error) {
    error('event.database.getEventProcessingByEventId - Error getting event processing by event id:', res.error);
    throw res.error;
  }

  return convertObjectKeysToCamelCase(res.data) as IEventProcessing;
}
