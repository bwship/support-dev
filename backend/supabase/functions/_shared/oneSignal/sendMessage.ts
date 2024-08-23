import { NotificationTargetChannelEnum } from 'onesignal';
import { UUID } from '../auth/UUID.ts';
import { debug, error } from '../helpers/logging.ts';
import * as OneSignal from 'onesignal';

const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID')!;
const oneSignalRestApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY')!;

type MessageContent = {
  message?: string

  /**
   *The email preheader is the short snippet of text that appears next to an email's subject line in a user's inbox. 
   The preheader is intended to provide a brief preview or summary of the email content to give the recipient more context before opening the message.
   *
   * @type {string}
   */
  emailPreHeader?: string
  emailSubject?: string
  emailBody?: string
}

const configuration = OneSignal.createConfiguration({
  appKey: oneSignalRestApiKey,
});

const oneSignal = new OneSignal.DefaultApi(configuration);

/**
 * @description sends a push, sms or email notification to one or more users based on their userId and subscription
 * @param channel - acceptable channels to use for sending a message.
 * @param userIds - an array of userIds to send pushes to
 * @param messageContent - the message to send to the users
 * @returns the id of the response from onesignal
 */
export async function sendMessage(channel: NotificationTargetChannelEnum, userIds: UUID[], messageContent: MessageContent): Promise<string | undefined> {
  try {
    debug('oneSignalService.sendMessage', { notificationTargetChannel: channel, data: {userIds: userIds, messageContent: messageContent } });

    const notification = new OneSignal.Notification();
    const lowercasedUserIds: string[] = userIds.map((userId) => userId.toLowerCase());

    notification.app_id = oneSignalAppId;
    notification.channel_for_external_user_ids = channel;
    notification.include_external_user_ids = lowercasedUserIds;

    if (channel === 'push') { // Send Message(s) via PUSH notification.
      notification.contents = {
        en: messageContent.message,
      };
    } else if (channel === 'sms') { // Send Message(s) via SMS.
      notification.sms_from = Deno.env.get('ONESIGNAL_PHONE_NUMBER');
      // notification.include_phone_numbers = ['+12223334444']; // Note that a list of phone numbers can also be used.
      notification.name = 'Support.dev'; // Is this correct or should it be some other name and possibly in the ENV file?
      notification.contents = {
        en: messageContent.message,
      };
    } else if (channel === 'email') { // Send Message(s) via EMAIL.
      // notification.include_email_tokens = ['email addresses']; // Note that a list of email addresses can also be used.
      notification.email_preheader = messageContent.emailPreHeader;
      notification.email_subject = messageContent.emailSubject;
      notification.email_body = messageContent.emailBody; // Depending on how we are going to use this we probably need to create a function to generate the email body
      notification.email_from_address = Deno.env.get('ONESIGNAL_EMAIL_FROM_ADDRESS');
      notification.email_from_name = Deno.env.get('ONESIGNAL_EMAIL_FROM_NAME');
    }

    // console.log('NOTIFICATION: ', notification);

    const response = await oneSignal.createNotification(notification);

    if (response.errors) {
      error('oneSignalService.sendMessage - Errors sending notifications - handling gracefully', { errors: response.errors });
    }

    return response.id;
  } catch (ex) {
    error('oneSignalService.sendMessage  - Failed to create OneSignal notification', { ex })
    throw ex;
  }
}
