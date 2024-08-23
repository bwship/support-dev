import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { NotificationStatusType } from '../index.ts';

export async function updateNotificationStatus(
  notificationId: number,
  status: NotificationStatusType,
  proof?: string
): Promise<number> {
  debug('event.updateNotificationStatus', { notificationId });
  
  const res = await supabaseClient
    .rpc('fn_notification_update', {
        _notification_id: notificationId,
        _status: status,
        _proof: proof
    });
  
  if (res.error) {
    error('event.changeNotificationStatusToSent - Failed to update notification status:', res.error);    
    throw res.error;
  }

  return res.data;
}
