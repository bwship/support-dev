import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';


export async function updateRequestRanking(
  requestId: number,
  ranking: number | null,
): Promise<number> {
  debug('event.database.updateRequestRanking', { requestId, ranking });

  const res = await supabaseClient
    .rpc('fn_event_step_request_ranking_update', {
      _id: requestId,
      _ranking: ranking,
    });

  if (res.error) {
    error('event.database.updateRequestRanking - Error updating request ranking: ', res.error);
    throw res.error;
  }

  return res.data;
}
