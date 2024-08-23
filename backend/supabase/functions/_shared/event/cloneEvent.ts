import { formatDateISO8601, debug, error } from '../helpers/index.ts';
import { getEventByStartDate } from './database/getEventByStartDate.ts';
import {
  getActiveStepsByEventId,
  getEventById,
  upsertEvent,
  IMealAttribute,
  ITransportationAttribute,
  IChildCareAttribute,
  upsertStep,
} from './index.ts';

function calculateNewStepDateTime(eventStartDateString: string, stepDateTimeString: string, newEventStartDateString: string): string {
  const eventStartDate = new Date(eventStartDateString.split('T')[0]);
  const stepDateTime = new Date(stepDateTimeString);
  const newEventStartDate = new Date(newEventStartDateString.split('T')[0]);

  // Calculate the time difference in milliseconds
  const timeDifference = stepDateTime.getTime() - eventStartDate.getTime();

  // Add the time difference to newEventDate
  return formatDateISO8601(new Date(newEventStartDate.getTime() + timeDifference));
}

export async function cloneEvent(eventId: number, newEventStartDate: Date) {
  debug('events.cloneEvent', { eventId, newEventDate: newEventStartDate });

  const newEventStartDateString = newEventStartDate.toISOString().split('T')[0];

  const event = await getEventById(eventId);
  if (!event) {
    error('events.cloneEvent - Event was not found - event id:', { eventId });
    throw (`events.cloneEvent - Event with id ${eventId} was not found.`);
  }

  if (!event.startDate) {
    error('events.cloneEvent - Event does not have a start date.');
    throw ('events.cloneEvent - Event does not have a start date.');

  }

  // Check if event already exist of that start date
  let newEventId = null;
  const existingEvent = await getEventByStartDate(newEventStartDateString);

  if (existingEvent?.id) {
    newEventId = existingEvent.id;
  }
  else {
    newEventId = await upsertEvent(event.name, event.description ? event.description : '', newEventStartDateString, event.teamId);
  }

  if (!newEventId) {
    error('events.cloneEvent - Could not create a new event');
    throw ('events.cloneEvent - Could not create a new event');
  }

  const steps = await getActiveStepsByEventId(eventId);

  const insertPromises: Promise<number>[] = [];
  for (const step of steps) {
    let newAttributes: IMealAttribute | ITransportationAttribute | IChildCareAttribute = {};

    switch (step.type) {
      case "CHILD_CARE": {
        const childCareAttributes = step.childCareAttributes;

        newAttributes = {
          addressId: childCareAttributes?.addressId ?? undefined,
          familyMemberIds: childCareAttributes?.familyMemberIds ?? undefined,
          startAt: childCareAttributes?.startAt ? calculateNewStepDateTime(event.startDate, childCareAttributes.startAt, newEventStartDateString) : undefined,
          endAt: childCareAttributes?.endAt ? calculateNewStepDateTime(event.startDate, childCareAttributes.endAt, newEventStartDateString) : undefined
        };
        break;
      }
      case "MEAL": {
        const mealAttributes = step.mealAttributes;

        newAttributes = {
          addressId: mealAttributes?.addressId ?? undefined,
          familyMemberIds: mealAttributes?.familyMemberIds ?? undefined,
          dropoffAt: mealAttributes?.dropoffAt ? calculateNewStepDateTime(event.startDate, mealAttributes.dropoffAt, newEventStartDateString) : undefined
        };
        break;
      }
      case 'TRANSPORTATION': {
        const transportationAttributes = step.transportationAttributes;

        newAttributes = {
          startAddressId: transportationAttributes?.startAddressId ?? undefined,
          endAddressId: transportationAttributes?.endAddressId ?? undefined,
          pickupAt: transportationAttributes?.pickupAt ? calculateNewStepDateTime(event.startDate, transportationAttributes.pickupAt, newEventStartDateString) : undefined
        };
        break;
      }
    }

    insertPromises.push(upsertStep(newEventId, step.type, step.notes ? step.notes : '', newAttributes));
  }

  await Promise.all(insertPromises);

  return newEventId;
}
