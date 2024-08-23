import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { debug, error } from '../../helpers/logging.ts';

export async function deleteNotificationById(notificationId: number): Promise<boolean> {
  debug('notifications.deleteNotificationById', { notificationId });

  const res = await supabaseClient
    .from('notification')
    .delete()
    .eq('id', notificationId)

  if (res.error) {
    error('notification.deleteNotificationById - Error deleting notification by id:', res.error);
    throw res.error;
  }

  return true;
}
