
import { assertEquals, assertNotEquals } from 'asserts';
import {
  IMealAttribute,
  cloneEvent,
  deactivateEvent,
  getActiveStepsByEventId,
  getSeedProfile,
  upsertEvent,
} from '../../functions/_shared/event/index.ts';
import { formatDateISO8601 } from '../../functions/_shared/helpers/formatDateISO8601.ts';
import { generateRandomId } from '../../functions/_shared/helpers/index.ts';
import { getProfileByField } from '../../functions/_shared/profile/index.ts';
import { upsertStep } from '../../functions/_shared/event/database/upsertStep.ts';

const testCloneEvent = async () => {
  const userProfile = await getSeedProfile();

  if (!userProfile) {
    throw new Error('Profile is undefined or null');
  }

  const profile = await getProfileByField('id', userProfile.id);

  const firstDate = new Date();
  firstDate.setDate(firstDate.getDate() + 1);
  const firstEventDate = firstDate.toISOString().split('T')[0];

  const firstDateAtNoon = new Date(firstEventDate);
  firstDateAtNoon.setHours(12, 0, 0, 0); // Set time to 12:00:00.000
  const firstStepDate = formatDateISO8601(firstDateAtNoon);

  const secondDate = new Date();
  secondDate.setDate(secondDate.getDate() + 10);
  const secondEventDate = secondDate.toISOString().split('T')[0];

  const secondDateAtNoon = new Date(secondEventDate);
  secondDateAtNoon.setHours(12, 0, 0, 0); // Set time to 12:00:00.000
  const expectedSecondStepDate = formatDateISO8601(secondDateAtNoon);

  const firstEventId = await upsertEvent('Test Event ' + generateRandomId(10),
    `events-process.test: testProcessEvent`,
    firstEventDate,
    profile.teamId ?? -1);
  assertNotEquals(firstEventId, undefined, "Could not create the first event.");

  const mealAttribute: IMealAttribute = {
    dropoffAt: firstStepDate
  };

  const firstStepId = await upsertStep(firstEventId, 'MEAL', `events-process.test: testProcessEvent`, mealAttribute);
  assertNotEquals(firstStepId, undefined, "Could not create the first step");

  const secondEventId = await cloneEvent(firstEventId, secondDate);
  assertNotEquals(secondEventId, undefined, "Could not clone the event");

  const clonedSteps = await getActiveStepsByEventId(secondEventId);

  assertEquals(clonedSteps.length, 1, "clonedSteps expected to have one step");
  const clonedStep = clonedSteps[0];
  const clonedMealAttribute = clonedStep.mealAttributes;
  assertEquals(clonedMealAttribute != undefined, true, "Cloned meal attribute does not exist");
  if (clonedMealAttribute) {
    assertEquals("dropoffAt" in clonedMealAttribute, true, "dropoffAt was not found on meal attribute");
    const clonedDropoffAt = clonedMealAttribute.dropoffAt;
    assertEquals(clonedDropoffAt, expectedSecondStepDate);
  }

  assertEquals(await deactivateEvent(firstEventId), true);
  assertEquals(await deactivateEvent(secondEventId), true);
};

Deno.test('Clone event test', testCloneEvent);
