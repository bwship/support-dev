
import { assertEquals, assertNotEquals } from 'asserts';
import {
  deactivateEvent,  
  getEventProcessingByEventId,
  processUpcomingEvents,
  upsertEvent,
} from '../../functions/_shared/event/index.ts';
import {
  rallierUserCreds,
  supabaseSignIn,
} from '../helpers/supabaseSingleton.ts';

import { generateRandomId } from '../../functions/_shared/helpers/index.ts';
import { upsertStep } from '../../functions/_shared/event/database/upsertStep.ts';

const testProcessEvent = async () => {
  await supabaseSignIn(rallierUserCreds);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDate = tomorrow.toISOString().split('T')[0];

  const eventId = await upsertEvent('Test Event ' + generateRandomId(10),
    `events-process.test: testProcessEvent`,
    startDate,
    rallierUserCreds.team_id ?? -1);
  assertNotEquals(eventId, undefined);

  const stepId = await upsertStep(eventId, 'MEAL', `events-process.test: testProcessEvent`);
  assertNotEquals(stepId, undefined);

  await processUpcomingEvents();

  const processingEvent = await getEventProcessingByEventId(eventId);
  if (processingEvent === undefined) {
    assertNotEquals(processingEvent, undefined);
  }
  else {
    assertNotEquals(processingEvent, undefined);
    assertEquals(processingEvent.status, 'PENDING');
    assertEquals(processingEvent.eventId, eventId);
  }
  assertEquals(await deactivateEvent(eventId), true);
};

Deno.test('Events upsert an event Test', testProcessEvent);
