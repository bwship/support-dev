import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import { NotificationChannelType } from '../index.ts';

export async function insertNotification(
  profileId: number,
  subject = '',
  content: string,
  channel: NotificationChannelType,
  traceback: string,
): Promise<number> {
  debug('event.insertNotification', { profileId, subject, content, channel, traceback });
  
  const res = await supabaseClient
    .rpc('fn_notification_insert', {
        _profile_id: profileId,
        _subject: subject,
        _content: content,
        _channel: channel,
        _traceback: traceback
    });
  
  if (res.error) {
    error('event.insertNotification - Failed to insert notification:', res.error);    
    throw res.error;
  }

  return res.data;
}
