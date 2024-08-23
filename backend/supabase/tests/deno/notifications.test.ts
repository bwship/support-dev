
import { assert, assertEquals, assertNotEquals } from 'asserts';
import { generateRandomId } from '../../functions/_shared/helpers/index.ts';
import i18n from '../../functions/_shared/i18n/i18n.ts';
import { getProfileByField } from '../../functions/_shared/profile/index.ts';
import {
  rallierUserCreds
} from '../helpers/supabaseSingleton.ts';
import {
  deleteNotificationById,
  insertNotification,
  NotificationChannel,
  NotificationStatus,
  processNotifications,  
  searchNotifications,
  updateNotificationStatus,
} from '../../functions/_shared/notifications/index.ts';
import {
  deactivateEvent,
  getEventById,
  upsertEvent,
} from '../../functions/_shared/event/index.ts';
import { placeholderTokens } from '../../functions/_shared/i18n/placeholderTokens.ts';

const testInsertAndDeleteNotification = async () => {
  // SLACK
  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testInsertAndDeleteNotification');
  assertNotEquals(notificationId, undefined);

  const res = await deleteNotificationById(notificationId);
  assertEquals(res, true);

  // PHONE
  const notificationPhoneId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.PHONE, 'testInsertAndDeleteNotification');
  assertNotEquals(notificationPhoneId, undefined);

  const res2 = await deleteNotificationById(notificationPhoneId);
  assertEquals(res2, true);
};

const testSearchNotificationById = async () => {
  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testSearchNotificationById');
  assertNotEquals(notificationId, undefined);

  const notifications = await searchNotifications(notificationId);
  assertEquals(notifications.length, 1);

  const res = await deleteNotificationById(notificationId);
  assertEquals(res, true);
};

const testSearchNotificationByProfileId = async () => {
  const before_notifications = await searchNotifications(undefined, rallierUserCreds.profile_id);

  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testSearchNotificationByProfileId');
  assertNotEquals(notificationId, undefined);

  const after_notifications = await searchNotifications(undefined, rallierUserCreds.profile_id);

  assertEquals(after_notifications.length - before_notifications.length, 1);

  const res = await deleteNotificationById(notificationId);
  assertEquals(res, true);
};

const testSearchNotificationByStatus = async () => {
  const before_pending_notifications = await searchNotifications(undefined, undefined, NotificationStatus.PENDING);
  const before_sent_notifications = await searchNotifications(undefined, undefined, NotificationStatus.SENT);

  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testSearchNotificationByStatus');
  assertNotEquals(notificationId, undefined);

  const after_pending_notifications = await searchNotifications(undefined, undefined, NotificationStatus.PENDING);
  const after_sent_notifications = await searchNotifications(undefined, undefined, NotificationStatus.SENT);

  assertEquals(after_pending_notifications.length - before_pending_notifications.length, 1);
  assertEquals(after_sent_notifications.length - before_sent_notifications.length, 0);

  const res = await deleteNotificationById(notificationId);
  assertEquals(res, true);
};

const testSearchNotificationByChannel = async () => {
  const before_notifications = await searchNotifications(undefined, undefined, undefined, NotificationChannel.SLACK);  

  // SLACK
  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testSearchNotificationByChannel');
  assertNotEquals(notificationId, undefined);

  const after_notifications = await searchNotifications(undefined, undefined, undefined, NotificationChannel.SLACK);

  assertEquals(after_notifications.length - before_notifications.length, 1);

  const res = await deleteNotificationById(notificationId);
  assertEquals(res, true);

  // PHONE
  const notificationPhoneId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.PHONE, 'testSearchNotificationByChannel');
  assertNotEquals(notificationPhoneId, undefined);

  const afterPhoneNotifications = await searchNotifications(undefined, undefined, undefined, NotificationChannel.PHONE);

  assertEquals(afterPhoneNotifications.length - before_notifications.length, 2);

  const res2 = await deleteNotificationById(notificationPhoneId);
  assertEquals(res2, true);
};

const testChangeNotificationStatus = async () => {
  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testChangeNotificationStatus');
  assertNotEquals(notificationId, undefined);

  const before_notifications = await searchNotifications(notificationId);
  assertEquals(before_notifications.length, 1);
  assertEquals(before_notifications[0].status, NotificationStatus.PENDING)

  await updateNotificationStatus(notificationId, NotificationStatus.SENT);

  const after_notifications = await searchNotifications(notificationId);
  assertEquals(after_notifications.length, 1);
  assertNotEquals(after_notifications[0].status, NotificationStatus.PENDING)

  const res2 = await deleteNotificationById(notificationId);
  assertEquals(res2, true);
};

const testSearchNotificationByCreationDate = async () => {
  // Current date and time
  const now: Date = new Date();

  // Date and time 5 minutes in the future
  const fiveMinutesFuture: Date = new Date(now.getTime() + 5 * 60 * 1000);

  // Date and time 5 minutes in the past
  const fiveMinutesPast: Date = new Date(now.getTime() - 5 * 60 * 1000);

  const before_notifications = await searchNotifications(undefined, undefined, undefined, undefined, undefined, undefined, fiveMinutesPast.toUTCString(),fiveMinutesFuture.toUTCString());

  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testSearchNotificationByCreationDate');
  assertNotEquals(notificationId, undefined);

  const after_notifications = await searchNotifications(undefined, undefined, undefined, undefined, undefined, undefined, fiveMinutesPast.toUTCString(),fiveMinutesFuture.toUTCString());  

  assertEquals(after_notifications.length - before_notifications.length, 1);

  const res = await deleteNotificationById(notificationId);
  assertEquals(res, true);
};

const testSearchNotificationByCreationDate2 = async () => {
  // Current date and time
  const now: Date = new Date();

  // Date and time 10 minutes in the past
  const tenMinutesPast: Date = new Date(now.getTime() - 10 * 60 * 1000);

  // Date and time 5 minutes in the past
  const fiveMinutesPast: Date = new Date(now.getTime() - 5 * 60 * 1000);

  const before_notifications = await searchNotifications(undefined, undefined, undefined, undefined, undefined, undefined, tenMinutesPast.toUTCString(),fiveMinutesPast.toUTCString());

  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testSearchNotificationByCreationDate2');
  assertNotEquals(notificationId, undefined);

  const after_notifications = await searchNotifications(undefined, undefined, undefined, undefined, undefined, undefined, tenMinutesPast.toUTCString(),fiveMinutesPast.toUTCString());  

  assertEquals(after_notifications.length - before_notifications.length, 0);

  const res = await deleteNotificationById(notificationId);
  assertEquals(res, true);
};

const testProcessNotifications = async () => {
  const notificationId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.SLACK, 'testProcessNotifications');
  assertNotEquals(notificationId, undefined);

  const notificationPhoneId = await insertNotification(rallierUserCreds.profile_id, generateRandomId(16), 'Test Content', NotificationChannel.PHONE, 'testProcessNotifications');
  assertNotEquals(notificationPhoneId, undefined);

  await processNotifications();

  const notifications = await searchNotifications(notificationId);
  assertEquals(notifications.length, 1);
  assertEquals(notifications[0].status, NotificationStatus.SENT)

  const res = await deleteNotificationById(notificationId);
  assertEquals(res, true);

  const notificationsPhone = await searchNotifications(notificationPhoneId);
  assertEquals(notificationsPhone.length, 1);
  //Note: Not testing the notification status like we do above for Slack
  //      because it will fail if no phone number is provided.
  //      If we add a phone number in, it will always send out text messages.
  //      every time the test is run - that may not be desired.

  const res2 = await deleteNotificationById(notificationPhoneId);
  assertEquals(res2, true);
};

const testResolveBrackets = async () => {
  const profile = await getProfileByField('id', rallierUserCreds.profile_id);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDate = tomorrow.toISOString().split('T')[0];

  const eventId = await upsertEvent('Test Event ' + generateRandomId(10),
    'notifications.test: testResolveBrackets',
    startDate,
    profile.teamId ?? -1,
  );
  assertNotEquals(eventId, undefined);

  const event = await getEventById(eventId);  
  assert(event != undefined);

  const t = i18n();  
  const content_before = t('StepReminderContent');
  assert (content_before.includes('{{clientFirstName}}'));
  assert (content_before.includes('{{eventStartDate}}'));

  const tokens = placeholderTokens(event, undefined, undefined, profile);
  const content_after = t('StepReminderContent', tokens);
  assert (!content_after.includes('{{clinetFirstName}}'))
  assert (!content_after.includes('{{eventStartDate}}'));
  assert (content_after.includes(profile.firstName));  

  assertEquals(await deactivateEvent(event.id), true);
};

Deno.test('Insert and Delete Notification Test', testInsertAndDeleteNotification);
Deno.test('Search Notification By Id Test', testSearchNotificationById);
Deno.test('Search Notification By Profile Id Test', testSearchNotificationByProfileId);
Deno.test('Search Notification By Status Test', testSearchNotificationByStatus);
Deno.test('Search Notification By Creation Date Test', testSearchNotificationByCreationDate);
Deno.test('Search Notification By Creation Date (2) Test', testSearchNotificationByCreationDate2);
Deno.test('Search Notification By Channel Test', testSearchNotificationByChannel);
Deno.test('Change Notification Status To Sent Test', testChangeNotificationStatus);
Deno.test('Process Notification Test', testProcessNotifications);
Deno.test('Resolving Brackets Test', testResolveBrackets);
