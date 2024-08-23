import { debug, error, warning } from '../helpers/logging.ts';
import { sendMessage as sendMessageSlack } from '../slack/sendMessage.ts';
import { sendMessage as sendMessageOneSignal } from '../oneSignal/sendMessage.ts';
import { getProfileByField } from '../profile/index.ts';
import {
  INotification,
  NotificationChannel,
  NotificationStatus,
  searchNotifications,
  updateNotificationStatus,
} from './index.ts';

const env = Deno.env.get('SUPPORT_ENV');

export async function processNotification(notification? : INotification, notificationId?: number) {
  debug('notifications.processNotification', { notification, notificationId });

  if (notification == undefined && notificationId == undefined) {
    throw "notifications.processNotification - Error: Both notification and notificationId cannot be undefined.";
  }

  if (notification == undefined || notificationId != undefined) {
    const notifications = await searchNotifications(notificationId);

    if (notifications.length !== 1 || notifications[0] == undefined) {
        throw "notifications.processNotification - Error: Searched for notification id but could not find it.";
    }

    notification = notifications[0];
  }

  let sentProof = undefined;
  const profile = await getProfileByField('id', notification.profileId);

  switch (notification.channel) {
    case NotificationChannel.PHONE: {
      try {
        debug('notifications.processNotification - sendMessageOneSignal via SMS', { profile, notification });
        const id = await sendMessageOneSignal('sms', [profile.userId], {message: notification.content}, );

        if (id != undefined) {
          sentProof = id;
        }
      } catch(_error) {
        error('notifications.processNotification - Error sending oneSignal: ', _error);
      }

      break;
    }

    case NotificationChannel.PUSH: {
      try {
        debug('notifications.processNotification - sendMessageOneSignal via PUSH', { profile, notification });
        const id = await sendMessageOneSignal('push', [profile.userId], {message: notification.content} );

        if (id != undefined) {
          sentProof = id;
        }
      } catch(_error) {
        error('notifications.processNotification - Error sending oneSignal: ', _error);
      }

      break;
    }

    case NotificationChannel.EMAIL: {
      try {
        debug('notifications.processNotification - sendMessageOneSignal via EMAIL', { profile, notification });
        const id = await sendMessageOneSignal('email', [profile.userId], {emailPreHeader: notification.preHeader, emailSubject: notification.subject, emailBody: notification.content} );

        if (id != undefined) {
          sentProof = id;
        }
      } catch(_error) {
        error('notifications.processNotification - Error sending oneSignal: ', _error);
      }

      break;
    }

    case NotificationChannel.SLACK: {
      let message = notification.content

      if (notification.subject != undefined) {
        message = notification.subject + ' - ' + message
      }

      try {
        const response = await sendMessageSlack(`#support-${env}`, message);

        if (response != undefined) {
          if (response.ok != undefined && response.ok === true) {
            sentProof = "Ok"
          } else if (response.warning != undefined) {
            warning('notifications.processNotification - Slack service warning: ', response.warning);
          } else if (response.error != undefined) {
            error('notifications.processNotification - Slack service error: ', response.error);
          }
        }
      } catch(_error) {
        error('notifications.processNotification - Error sending Slack message: ', _error);
      }

      break;
    }
  }

  if (sentProof) {
    await updateNotificationStatus(notification.id, NotificationStatus.SENT, sentProof);
  } else {
    await updateNotificationStatus(notification.id, NotificationStatus.FAILED);
  }

  return true;
}
