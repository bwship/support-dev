import { debug, error as logError } from '../helpers/logging.ts';
import { User } from '@supabase/supabase-js';
import { getUserById, UUID } from '../auth/index.ts'
import supabaseClient from '../helpers/supabaseSingleton.ts';
import {
  getProfileByField,
  IProfile,
} from './index.ts';

/**
 * @description resend an invitation to a helper that has been invited to the system
 * @param userId - the user to resend the invitation to
 * @param invitedByUserId - the user who is isending the reinvitation
 * @returns boolean true if sent, else false
 */
export async function resendInvite(userId: UUID, invitedByUserId: UUID): Promise<boolean> {
  debug('authService.resendInvite', { userId, invitedByUserId });

  const operations: Array<Promise<IProfile | User | undefined>> = [];

  operations.push(getProfileByField('user_id', userId));
  operations.push(getProfileByField('user_id', invitedByUserId));
  operations.push(getUserById(userId));

  const results = await Promise.all(operations);
  const [profile, invitedByProfile, user] = results as [IProfile | undefined, IProfile | undefined, User];

  if (!profile || !invitedByProfile || !user) {
    logError('error retrieving profiles or users', { profile, invitedByProfile, user });
    throw new Error('error retrieving profiles or users');
  }

  const { email } = user;

  if (!email) {
    logError('no email to send to', { user });
    throw new Error('no email to send to');
  }

  const userMetadata = {
    firstName: user.user_metadata['first_name'],
    lastName: user.user_metadata['last_name'],
    invitedByFirstName: invitedByProfile.firstName,
    invitedByLastName: invitedByProfile.lastName,
  };

  const { data, error } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
    data: userMetadata,
  });

  if (error) {
    logError('Error inviting user', { error })
    throw error;
  }

  return true;
}
