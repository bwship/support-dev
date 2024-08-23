import { UUID } from './UUID.ts';
import { decode as jwtDecode } from 'djwt';
import { debug, error } from '../helpers/index.ts';

/**
 * @description gets a userId based on the jwt token they use to call the API
 * @param context - the context object passed up when invoking an edge function
 * @returns UUID of the userId or undefined
 */

export async function getUserIdByJwt(context: any): Promise<UUID | undefined> {
  try {
    debug('auth.getUserIdByJwt', context);

    const { headers } = context.request;
    const authorization = headers.get('authorization');
    const jwt = authorization?.split(' ')[1];

    const payload = await jwtDecode(jwt as string) as any;

    if (payload.length >= 2) {
      const userId = payload[1].sub;
      return userId;
    } else {
      throw new Error('auth.getUserIdByJwt - Invalid JWT payload');
    }
  } catch (ex) {
    error('auth.getUserIdByJwt - error retrieving userId from jwt', { ex });
    return undefined;
  }
}
