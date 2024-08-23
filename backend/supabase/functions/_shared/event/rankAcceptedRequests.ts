import { debug } from '../helpers/logging.ts';
import { IRequest } from './types/IRequest.ts';

const MAX_ALLOWED_RANKINGS = 3;

export function rankAcceptedRequests(acceptedRequests: IRequest[]) {
  debug('event.rankAcceptedRequests', { acceptedRequests } )

  // Create a shallow copy of acceptedRequests and sort by ranking in ascending order, ignoring null values
  const sortedRequests = [...acceptedRequests].sort((a, b) => (a.ranking || MAX_ALLOWED_RANKINGS + 1) - (b.ranking || MAX_ALLOWED_RANKINGS + 1));

  // Create a map to keep track of the new rankings
  // Note, this assigns rankings 1, 2, and 3 to the top 3 requests, and null to the rest
  const newRankings = new Map(sortedRequests.map((request, index) => [request, index < MAX_ALLOWED_RANKINGS ? index + 1 : undefined]));

  // Apply the new rankings to the original array
  acceptedRequests.forEach(r => r.ranking = newRankings.get(r));

  return acceptedRequests;
}
