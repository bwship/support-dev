import { debug, info, error as logError } from '../helpers/logging.ts';
import { sendMessage } from '../slack/index.ts'
import supabaseClient from '../helpers/supabaseSingleton.ts';
import {
  getProfileByField,
  IProfile,
  upsertProfileAndRelationship,
} from './index.ts';
import { UUID } from '../auth/UUID.ts';

const env = Deno.env.get('SUPPORT_ENV');

/**
 * @description attempts to create a user, profile, and relationship for someone,
 *  and sends out an invite to them via email
 * @param profle - the profile to create
 * @param createdByUserId - who is creating it
 * @returns the newly created profile record IProfile
 */
export async function createProfile(profile: IProfile, createdByUserId: UUID): Promise<IProfile | undefined> {
  debug('profile.createProfile', { profile, createdByUserId });

  const { email, firstName, lastName, phoneNumber } = profile;
  let existingProfile: IProfile | undefined = undefined;
  const invitedByProfile = await getProfileByField('user_id', createdByUserId);

  if (email) {
    existingProfile = await getProfileByField('email', email);

    if (existingProfile) {
      throw new Error('User already exists'); 
    }

    const userMetadata = {
      firstName,
      lastName,
      invitedByFirstName: invitedByProfile['firstName'],
      invitedByLastName: invitedByProfile['lastName'],
    };

    const { data, error } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      data: userMetadata,
    });

    // If user has been invited before
    if (error) {
      if (error.status === 422) {
        info(`User with email ${email} has already been invited - handling gracefully`)
        return;
      } else {
        logError('error calling supabaseClient.auth.admin.inviteUserByEmail', { error });
        throw error;
      }
    }

    // set the userId of this newly created user
    profile.userId = data?.user?.id;
  }

  // user should be set now, add the user metadata for phone number if one is provided
  if (profile.userId) {
    await supabaseClient.auth.admin.updateUserById(profile.userId, {
      phone: phoneNumber,
    });
  }

  profile.createdBy = createdByUserId;

  // add the user's profile and their relationship
  const profileId = await upsertProfileAndRelationship(profile, invitedByProfile.id);

  // retrieve the user
  const newProfile = await getProfileByField('id', profileId);

  // send slack message
  await sendMessage(`#support-${env}`, `New user invited to the system - ${profile.userId} - ${firstName} ${lastName}`);

  return newProfile;
}