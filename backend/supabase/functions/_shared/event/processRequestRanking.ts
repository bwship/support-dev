import { debug } from '../helpers/logging.ts';
import {
  EventStatus,
  getRequestsByStepId,
  IRequest,
  rankAcceptedRequests,
  updateRequestRanking,
} from './index.ts';

export async function processRequestRanking(eventId: number, stepId: number) {
  debug('event.processRequestRanking', { eventId, stepId });

  const stepRequests = await getRequestsByStepId(stepId);

  // gather the accepted requests
  const acceptedRequests: IRequest[] = stepRequests?.filter(r => r.status === EventStatus.ACCEPTED) ?? [];

  // re-rank the accepted requests
  const newAcceptedRequests = rankAcceptedRequests(acceptedRequests);

  // gather the unaccepted requests, to nullify
  let operations: Array<Promise<number>> = stepRequests?.filter(r => r.status !== EventStatus.ACCEPTED)
                                                          .map(r => updateRequestRanking(r.id, null)) ?? [];

  // update the accepted requests ranking
  operations = newAcceptedRequests.map(({ id, ranking }) => {
    const updatedRanking = ranking ?? null;
    return updateRequestRanking(id, updatedRanking);
  });

  await Promise.all(operations);
}
