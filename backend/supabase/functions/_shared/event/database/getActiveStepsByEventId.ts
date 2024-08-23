import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import { IStep } from '../types/IStep.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';

export async function getActiveStepsByEventId(eventId: number): Promise<IStep[]> {
  debug('event.database.getActiveStepsByEventId', { eventId });

  const res = await supabaseClient
    .from('vw_event_step')
    .select()
    .eq('event_id', eventId)
    .eq('is_active', true);

  if (res.error) {
    error('Error getting events for event id:', res.error);
    throw res.error;
  }

  return convertObjectKeysToCamelCase(res.data) as IStep[];
}
