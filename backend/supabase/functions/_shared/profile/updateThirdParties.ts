import { debug } from '../helpers/logging.ts';
import { sendMessage } from '../slack/index.ts'
import { sync as hubSpotContactSync } from '../hubspot/contact.ts';
import { saveUser } from '../oneSignal/index.ts'
import { getProfileByField } from './index.ts';
import { UUID } from '../auth/UUID.ts';

const env = Deno.env.get('SUPPORT_ENV');

/**
 * @description updates users in onesignal and hubspot
 * @param userId - the user to update
 * @param updatedByUserId - user who is updating
 * @returns boolean
 */
export async function updateThirdParties(userId: UUID, updatedByUserId: UUID): Promise<boolean | undefined> {
  debug('profile.updateThirdParties', { userId, updatedByUserId });

  const profile = await getProfileByField('user_id', userId);

  if (env !== 'prd') {
    // send slack message
    await sendMessage(`#support-${env}`, `Skipping third party for HubSpot sync in non prod environment - ${userId}`);
  } else {
    // send slack message
    await sendMessage(`#support-${env}`, `User third party update process run - ${userId}`);

    // Sync data to HubSpot
    await hubSpotContactSync(profile);
  }

  // Sync data to OneSignal
  await saveUser(profile);

  return true;
}

/**
 * @description updates users in onesignal and hubspot for preregister
 * @param email - the email to send
 * @param updatedByUserId - user who is updating
 * @returns boolean
 */
export async function updateThirdPartiesEmailOnly(email: string, updatedByUserId: UUID): Promise<boolean | undefined> {
  debug('profile.updateThirdParties', { email, updatedByUserId });

  if (env !== 'prd') {
    // send slack message
    await sendMessage(`#support-${env}`, `Skipping third party sync in non prod environment - ${email}`);
  } else {
    // send slack message
    await sendMessage(`#support-${env}`, `Preregister email third party update process run - ${email}`);

    const profile = {
      id: -1,
      attributes: {},
      firstName: 'Preregister',
      lastName: 'Beta',
      email,
      isActive: true,
      profileUrl: '',
      roles: [],
      userId: email,
      createdAt: new Date(),
      createdBy: updatedByUserId,
      updatedBy: updatedByUserId,
    };

    // Sync data to HubSpot
    await hubSpotContactSync(profile);
  }

  return true;
}