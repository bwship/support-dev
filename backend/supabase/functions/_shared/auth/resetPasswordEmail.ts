import { debug, error as logError } from '../helpers/logging.ts';
import supabaseClient from '../helpers/supabaseSingleton.ts';

/**
 * @description send an email to reset password
 * @param userId - the user to resend the invitation to
 * @returns boolean true if sent, else false
 */
export async function resetPasswordEmail(email: string): Promise<boolean> {
  debug('authService.resetPasswordEmail', { email });

  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email);

  if (error) {
    logError('Error sending reset password email', { error })
    throw error;
  }

  return true;
}
