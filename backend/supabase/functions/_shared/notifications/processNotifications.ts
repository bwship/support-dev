import { debug, error } from '../helpers/logging.ts';
import { NotificationStatus, processNotification, searchNotifications } from './index.ts';

export async function processNotifications() {
  debug('notifications.processNotifications');

  try {
    const notifications = await searchNotifications(undefined, undefined, NotificationStatus.PENDING);
    const operations = notifications.map((notification) => processNotification(notification));

    await Promise.all(operations);
  } catch (_error) {
    error('Error fetching notifications:', { _error });
    throw _error;
  }
}
