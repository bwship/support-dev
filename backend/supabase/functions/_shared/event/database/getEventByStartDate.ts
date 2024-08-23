import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import { IEvent } from '../types/IEvent.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';


export async function getEventByStartDate(startDate: string): Promise<IEvent | undefined> {
  debug('event.database.getEventByStartDate', { startDate });

  const res = await supabaseClient
    .from('vw_event')
    .select()
    .eq('start_date', startDate)
    .limit(1)
    .single();

  if (res.error) {
    error('event.database.getEventByStartDate - Error getting event by startDate:', res.error);
    throw res.error;
  }

  return convertObjectKeysToCamelCase(res.data) as IEvent;
}
