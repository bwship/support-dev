import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import { IStep } from '../types/IStep.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';

export async function getStepById(stepId: number): Promise<IStep | undefined> {
  debug('event.database.getStepById', { stepId });

  const res = await supabaseClient
    .from('vw_event_step')
    .select()
    .eq('id', stepId)
    .limit(1)
    .single();

  if (res.error) {
    error('event.database.getStepById - Error getting step by id:', res.error);
    throw res.error;
  }

  return convertObjectKeysToCamelCase(res.data) as IStep;
}
