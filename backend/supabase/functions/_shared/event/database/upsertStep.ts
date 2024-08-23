import { convertObjectKeysToSnakeCase } from '../../helpers/convertObjectKeysToSnakeCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { StepTypeType } from '../index.ts';

export async function upsertStep(
  eventId: number,
  type: StepTypeType,
  notes: string,
  attributes: unknown = {},
  id?: number
): Promise<number> {
  debug('event.database.upsertStep', { eventId, type, notes, attributes, id });

  const res = await supabaseClient
    .rpc('fn_event_step_upsert', {
      _event_id: eventId,
      _type: type,
      _attributes: convertObjectKeysToSnakeCase(attributes),
      _notes: notes,
      ...(id ? { _id: id } : {})
    });

  if (res.error) {
    error('event.database.upsertStep - Error upserting step: ', res.error);
    throw res.error;
  }

  return res.data as number;
}
