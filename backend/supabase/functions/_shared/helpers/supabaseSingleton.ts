import { createClient } from '@supabase/supabase-js';

export interface IUserCredentials {
  email: string
  password: string
}

// Note: For RLS to take effect we should use the ANON key. 
//       Using the SERVICE key bypasses RLS and has complete access to the DB.
const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') as string,
                                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string);

export async function supabaseSignIn(userCreds: IUserCredentials) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: userCreds.email,
      password: userCreds.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { user: data };
  } catch (error) {
    throw new Error('Sign-in failed: ' + error.message);
  }
}

export async function supabaseSignOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error('Sign-out failed: ' + error.message);
  }
}

export default supabaseClient;
