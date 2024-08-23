import { debug, error as logError } from '../helpers/logging.ts';
import { User } from '@supabase/supabase-js';
import { getUserById, UUID } from './index.ts'
import supabaseClient from '../helpers/supabaseSingleton.ts';

/**
 * @description resend a registration email to the user
 * @param userId - the user to resend the invitation to
 * @returns boolean true if sent, else false
 */
export async function resendRegistrationEmail(userId: UUID): Promise<boolean> {
  debug('authService.resendRegistrationEmail', { userId });

  const { email } = await getUserById(userId) as User;

  if (!email) {
    logError('error retrieving user email', { email });
    throw new Error('error retrieving profiles or users');
  }

  const { data, error } = await supabaseClient.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    logError('Error resending email registration', { error })
    throw error;
  }

  return true;
}
