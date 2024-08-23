import { debug, error } from '../helpers/logging.ts';
import i18n from '../i18n/i18n.ts';
import {
  EventProcessingStatus,
  getActiveStepsByEventId,
  getEventById,
  getRequestsByStepId,
  EventStatus,
  IEvent,
  sendStepReminders,
  sendStepRequests,
  updateEventProcessingById
} from './index.ts';
import {
  insertNotification,
  INotificationMapItem,
  NotificationChannel,
  NotificationPurpose,
  processNotification,
} from '../notifications/index.ts';
import { placeholderTokens } from '../i18n/placeholderTokens.ts';

const REMINDER_PERIOD_DAYS = 2;

function isStartDateWithInNDays(event: IEvent, n: number): boolean {
  if (!event.startDate) {
    return false;
  }

  const eventDate = new Date(event.startDate);   // Parse the event startDate.
  const currentDate = new Date();                // Get the current date.
  currentDate.setHours(0, 0, 0, 0);              // Set the current date to midnight.

  const nDaysFromNow = new Date(currentDate);
  nDaysFromNow.setDate(currentDate.getDate() + n);

  // Check if the eventDate is within the range [currentDate, n DaysFromNow].
  return (eventDate.getTime() >= currentDate.getTime()) &&
    (eventDate.getTime() <= nDaysFromNow.getTime());
}

export async function processEvent(eventId: number, eventProcessingId?: number) {
  debug('events.processEvent', { eventId, eventProcessingId });

  const event = await getEventById(eventId);
  if (!event) {
    error('events.processEvent - Event was not found - event id:', { eventId });
    throw (`events.processEvent - Event with id ${eventId} was not found.`);
  }

  const reminderPeriod = isStartDateWithInNDays(event, REMINDER_PERIOD_DAYS);
  const steps = await getActiveStepsByEventId(eventId);
  const notifications = new Map<string, INotificationMapItem[]>();

  for (const step of steps) {
    const requests = await getRequestsByStepId(step.id);
    debug(`events.processEvent - Found ${requests.length} requests for step ${step.id}. Reminder period: ${reminderPeriod}`);

    // Always send requests but exclude helpers for current requests.
    await sendStepRequests(event, step, requests, notifications);

    if (reminderPeriod && !requests.filter(step => step.status === EventStatus.ACCEPTED).length) {
      await sendStepReminders(event, step, requests.filter(r => r.status == EventStatus.INVITED || r.status == EventStatus.TENTATIVE), notifications);
    }
  }

  const notificationIdsPromises: Array<Promise<number>> = [];
  let subject: string, content: string, traceback: string;
  const t = i18n();  

  notifications.forEach((items, _key) => {
    const notification = items[0];
    const tokens = placeholderTokens(event, notification.step, notification.helperProfile, notification.clientProfile)    

    const { helperProfile, purpose, step } = notification;

    if (items.length == 1) {
      if (purpose == NotificationPurpose.STEP_REMINDER) {
        subject = t('StepReminderSubject', tokens);
        content = t('StepReminderContent', tokens);
        traceback = `Step Request Reminder for ${JSON.stringify(step)}`;
      } else if (purpose == NotificationPurpose.STEP_ISSUANCE) {
        subject = t('StepIssuanceSubject', tokens);
        content = t('StepIssuanceContent', tokens);
        traceback = `Step Request Issuance for ${JSON.stringify(step)}`;
      }
    } else {
      if (purpose == NotificationPurpose.STEP_REMINDER) {
        subject = t('MultipleStepReminderSubject', tokens);
        content = t('MultipleStepReminderContent', tokens);
        traceback = 'Step Request Reminder - Ids: ';
      } else if (purpose == NotificationPurpose.STEP_ISSUANCE) {
        subject = t('MultipleStepIssuanceSubject', tokens);
        content = t('MultipleStepIssuanceContent', tokens);
        traceback = 'Step Request Issuance - Ids: ';
      }
      items.forEach((value) => {
        traceback += `${value.stepRequestId}, `;
      });
    }

    notificationIdsPromises.push(insertNotification(helperProfile.id, subject, content, NotificationChannel.EMAIL, traceback));
    notificationIdsPromises.push(insertNotification(helperProfile.id, subject, content, NotificationChannel.PUSH, traceback));
    notificationIdsPromises.push(insertNotification(helperProfile.id, subject, content, NotificationChannel.SLACK, traceback));
    notificationIdsPromises.push(insertNotification(helperProfile.id, subject, content, NotificationChannel.PHONE, traceback));
  });

  const notificationIds = await Promise.all(notificationIdsPromises);

  const boolOperations: Array<Promise<boolean>> = [];
  notificationIds.forEach((id) => {
    boolOperations.push(processNotification(undefined, id));
  });

  await Promise.all(boolOperations);

  if (eventProcessingId) {
    await updateEventProcessingById(eventProcessingId, EventProcessingStatus.COMPLETED);
  }
}
