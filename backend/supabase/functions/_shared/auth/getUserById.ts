import { UUID } from './UUID.ts';
import { User } from '@supabase/supabase-js';
import { debug, error as logError } from '../helpers/index.ts';
import supabaseClient from '../helpers/supabaseSingleton.ts';

/**
 * @description get a user by their id
 * @param id - id of the user to retrieve
 * @returns User or undefined
 */
export async function getUserById(id: UUID): Promise<User | undefined> {
  debug('auth.getUserById', { id });

  const { data, error } = await supabaseClient.auth.admin.getUserById(id);

  if (error) {
    logError('auth.getUserById - error ', { error })
    throw error;
  }

  return data.user;
}