import { NotificationTargetChannelEnum } from 'onesignal';
import { UUID } from '../auth/UUID.ts';
import { debug, error } from '../helpers/logging.ts';
import * as OneSignal from 'onesignal';

const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID')!;
const oneSignalRestApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY')!;

const configuration = OneSignal.createConfiguration({
  appKey: oneSignalRestApiKey,
});

const oneSignal = new OneSignal.DefaultApi(configuration);

/**
 * @description save profiel information to onesignal
 * @param profile - profile to save
 * @returns boolean success
 */
export async function saveUser(profile: Profile): Promise<boolean> {
  try {
    debug('oneSignalService.saveUser', { profile });

    try {
      const user = new OneSignal.User();

      const aliasLabel = 'external_id';
      const aliasId = profile.userId;

      user.identity = {
        [aliasLabel]: aliasId,
      };

      user.subscriptions = []

      if (profile.email) {
        user.subscriptions.push({
          type: "Email",
          token: profile.email,
        });
      }

      if (profile.phone) {
        user.subscriptions.push({
          type: "SMS",
          token: formatPhoneNumber(profile.phone),
        });
      }

      const createdUser = await oneSignal.createUser(oneSignalAppId, user);
    } catch (error) {
      console.error('Error creating subscription:', error);
    }

    return true;
  } catch (ex) {
    error('oneSignalService.saveUser  - Failed to create OneSignal user', { ex })
    throw ex;
  }
}

// Function to convert phone number to E.164 format
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber?.length) {
    return null
  }

  // Remove any non-digit characters from the phone number
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

  // Check if the phone number starts with a country code
if (!cleanedPhoneNumber.startsWith('+')) {
    // If not, add the default country code
    return `+1${cleanedPhoneNumber}`; // Assuming default country code is +1 (USA)
  }

  // Otherwise, the phone number is already in E.164 format
  return cleanedPhoneNumber;
}
