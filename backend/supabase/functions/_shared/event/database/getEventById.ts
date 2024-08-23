import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import { IEvent } from '../types/IEvent.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';


export async function getEventById(eventId: number): Promise<IEvent | undefined> {
  debug('event.database.getEventById', { eventId });

  const res = await supabaseClient
    .from('vw_event')
    .select()
    .eq('id', eventId)
    .limit(1)
    .single();

  if (res.error) {
    error('event.database.getEventById - Error getting event by id:', res.error);
    throw res.error;
  }

  return convertObjectKeysToCamelCase(res.data) as IEvent;
}
