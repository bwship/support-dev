import { convertObjectKeysToCamelCase } from '../../helpers/convertObjectKeysToCamelCase.ts';
import { debug, error } from '../../helpers/logging.ts';
import supabaseClient from '../../helpers/supabaseSingleton.ts';
import {
  INotification,
  NotificationChannelType,
  NotificationStatusType,
 } from '../index.ts';

export async function searchNotifications(
  id?: number,
  profileId?: number,
  status?: NotificationStatusType,
  channel?: NotificationChannelType,
  sentStartDate?: string,
  sentEndDate?: string,
  createdStartDate?: string,
  createdEndDate?: string
): Promise<INotification[]> {
  debug('notifications.searchNotifications', {
    id,
    profileId,
    status,
    channel,
    sentStartDate,
    sentEndDate,
    createdStartDate,
    createdEndDate
  });

  let query = supabaseClient
    .from('notification')
    .select();

  if (id) {
    query = query.eq('id', id);
  }

  if (profileId) {
    query = query.eq('profile_id', profileId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (channel) {
    query = query.eq('channel', channel);
  }

  if (sentStartDate != undefined && sentEndDate != undefined) {
    query = query.gte('sent_at', sentStartDate).lte('sent_at', sentEndDate)    
  }

  if (createdStartDate != undefined && createdEndDate != undefined) {
    query = query.gte('created_at', createdStartDate).lte('created_at', createdEndDate)    
  }

  const res = await query;

  if (res.error) {    
    error('notifications.searchNotifications - Error getting notifications:', res.error)
    throw res.error;
  }

  return convertObjectKeysToCamelCase(res.data) as INotification[];
}
