import { assertEquals } from 'asserts'
import {
  EventStatus,
  IRequest,
  rankAcceptedRequests,
} from '../../functions/_shared/event/index.ts';

const createMockData = (rankings: (number | undefined)[]): IRequest[] => {
  return rankings.map((ranking, index) => ({
    id: index + 1,
    stepId: 1,
    profileId: index + 1,
    status: EventStatus.ACCEPTED,
    createdAt: new Date(),
    createdBy: `user${index + 1}`,
    ranking,
  }));
};

const case1 = () => {
  // Accepted rankings are complete , no change needed
  const initialRankings = [3, 2, 1, undefined];
  const mockAcceptedRequests = createMockData(initialRankings);

  const expectedResults: IRequest[] = [
    { ...mockAcceptedRequests[0], ranking: 3 },
    { ...mockAcceptedRequests[1], ranking: 2 },
    { ...mockAcceptedRequests[2], ranking: 1 },
    { ...mockAcceptedRequests[3], ranking: undefined },
  ];

  const result = rankAcceptedRequests(mockAcceptedRequests);
  assertEquals(result, expectedResults);  
};

const case2 = () => {
  // Rank one is missing, rank 2 and 3 should shift to 1 and 2 and then a third one is needed
  const initialRankings = [undefined, 2, 3, undefined, undefined];
  const mockAcceptedRequests = createMockData(initialRankings);

  const expectedResults: IRequest[] = [
    { ...mockAcceptedRequests[0], ranking: 3 },
    { ...mockAcceptedRequests[1], ranking: 1 },
    { ...mockAcceptedRequests[2], ranking: 2 },
    { ...mockAcceptedRequests[3], ranking: undefined },
    { ...mockAcceptedRequests[4], ranking: undefined },    
  ];

  const result = rankAcceptedRequests(mockAcceptedRequests);
  assertEquals(result, expectedResults);  
};

const case3 = () => {
  // Only 3 rankings needed, the others should become null
  const initialRankings = [1, 2, 3, 4, 5];
  const mockAcceptedRequests = createMockData(initialRankings);

  const expectedResults: IRequest[] = [
    { ...mockAcceptedRequests[0], ranking: 1 },
    { ...mockAcceptedRequests[1], ranking: 2 },
    { ...mockAcceptedRequests[2], ranking: 3 },
    { ...mockAcceptedRequests[3], ranking: undefined },
    { ...mockAcceptedRequests[4], ranking: undefined },    
  ];

  const result = rankAcceptedRequests(mockAcceptedRequests);
  assertEquals(result, expectedResults);  
};

const case4 = () => {
  // Only 3 rankings needed, the others should become null
  const initialRankings = [5, 2, 1, 3, 4];
  const mockAcceptedRequests = createMockData(initialRankings);

  const expectedResults: IRequest[] = [
    { ...mockAcceptedRequests[0], ranking: undefined },
    { ...mockAcceptedRequests[1], ranking: 2 },
    { ...mockAcceptedRequests[2], ranking: 1 },
    { ...mockAcceptedRequests[3], ranking: 3 },
    { ...mockAcceptedRequests[4], ranking: undefined },
  ];

  const result = rankAcceptedRequests(mockAcceptedRequests);
  assertEquals(result, expectedResults);  
};

const case5 = () => {
  // missing rankings should be assigned
  const initialRankings = [undefined, undefined, undefined, undefined];
  const mockAcceptedRequests = createMockData(initialRankings);

  const expectedResults: IRequest[] = [
    { ...mockAcceptedRequests[0], ranking: 1 },
    { ...mockAcceptedRequests[1], ranking: 2 },
    { ...mockAcceptedRequests[2], ranking: 3 },
    { ...mockAcceptedRequests[3], ranking: undefined },
  ];

  const result = rankAcceptedRequests(mockAcceptedRequests);
  assertEquals(result, expectedResults);  
};

const case6 = () => {
  // missing rankings should be assigned
  const initialRankings = [undefined, undefined, undefined, 1];
  const mockAcceptedRequests = createMockData(initialRankings);

  const expectedResults: IRequest[] = [
    { ...mockAcceptedRequests[0], ranking: 2 },
    { ...mockAcceptedRequests[1], ranking: 3 },
    { ...mockAcceptedRequests[2], ranking: undefined },
    { ...mockAcceptedRequests[3], ranking: 1 },
  ];

  const result = rankAcceptedRequests(mockAcceptedRequests);
  assertEquals(result, expectedResults);  
};

Deno.test('Event Request Ranking Assignment Test Case 1', case1);
Deno.test('Event Request Ranking Assignment Test Case 2', case2);
Deno.test('Event Request Ranking Assignment Test Case 3', case3);
Deno.test('Event Request Ranking Assignment Test Case 4', case4);
Deno.test('Event Request Ranking Assignment Test Case 5', case5);
Deno.test('Event Request Ranking Assignment Test Case 6', case6);
