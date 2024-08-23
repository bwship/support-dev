import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import { IRequest } from '../types/IRequest.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';


export async function getRequestsByStepId(
  stepId: number,
): Promise<IRequest[]> {
  debug('event.database.getRequestsByStepId', { stepId });

  const res = await supabaseClient
    .from('vw_event_step_request')
    .select()
    .eq('event_step_id', stepId);

  if (res.error) {
    error('event.database.getRequestsByStepId - Error getting requests by step id:', res.error);
    throw res.error;
  }

  return convertObjectKeysToCamelCase(res.data) as IRequest[];
}
