import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _anonRoleSupabase: SupabaseClient;
let _anonRoleSupabaseSchema = 'public';

let _serviceRoleSupabase: SupabaseClient;
let _serviceRoleSupabaseSchema = 'public';

let _authServiceRoleSupabase: SupabaseClient;

export interface ITestUserCredentials {
  email: string
  password: string
  profile_id: number
  team_id?: number
}

// This is the user that created the event and therefore an authorized user.
export const systemAdminUserCreds: ITestUserCredentials = {
  email: 'bob.m.wall+admin@gmail.com',
  password: 'testing123',
  profile_id: 1,
  team_id: 1,
};

// This is the user that created the event and therefore an authorized user.
export const rallierUserCreds: ITestUserCredentials = {
  email: 'bob.m.wall@gmail.com',
  password: 'testing123',
  profile_id: 2,
  team_id: 2,
};

// This user is a helper to the rallier and is also an authorized user. (Group access)
export const helperUserCreds: ITestUserCredentials = {
  email: 'bob.m.wall+helper1@gmail.com',
  password: 'testing123',
  profile_id: 4,
  team_id: 2,
};

// This user is not part of Bob's Team (id=1) and is NOT an authorized user.
// Note: this is the same user as teamTwoAdminUserCreds
export const unauthorizedUserCreds: ITestUserCredentials = {
  email: 'bob.m.wall+other@gmail.com',
  password: 'testing123',
  profile_id: 7,
  team_id: 3,
};

export const teamOneAdminUserCreds: ITestUserCredentials = {
  email: 'bob.m.wall+teamadmin@gmail.com',
  password: `testing123`,
  profile_id: 3,
  team_id: 2,
};

export const bobsTeamAdminUser: ITestUserCredentials = {
  email: 'bob.m.wall+teamadmin@gmail.com',
  password: `testing123`,
  profile_id: 3,
  team_id: 2,
};

export const bobsTeamOwnerNotClientUser: ITestUserCredentials = {
  email: 'bob.m.wall+teamownernotclient@gmail.com',
  password: `testing123`,
  profile_id: 8,
  team_id: 2,
};

// This user is not part of Bob's Team (id=1) and is NOT an authorized user of that team.
// Note: this is the same user as unauthorizedUserCreds
export const teamTwoAdminUserCreds: ITestUserCredentials = {
  email: 'bob.m.wall+other@gmail.com',
  password: 'testing123',
  profile_id: 7,
  team_id: 3,
};

/////////////////////////////////////////////////////////////////////
// These are random users not tied to any team.
export const randomClientUserCreds: ITestUserCredentials = {
  email: 'random_client@randomemail.com',
  password: 'testing123',
  profile_id: 9,
};

export const randomTeamOwnerUserCreds: ITestUserCredentials = {
  email: 'random_team_owner@randomemail.com',
  password: 'testing123',
  profile_id: 10,
};

export const randomTeamAdminUserCreds: ITestUserCredentials = {
  email: 'random_team_admin@randomemail.com',
  password: 'testing123',
  profile_id: 11,
};

export const randomHelperUserCreds: ITestUserCredentials = {
  email: 'random_helper@randomemail.com',
  password: 'testing123',
  profile_id: 12,
};
/////////////////////////////////////////////////////////////////////

function initializeAnonRoleSupabase(schemaName = _anonRoleSupabaseSchema) {
  if (!_anonRoleSupabase || schemaName !== _anonRoleSupabaseSchema) {
    _anonRoleSupabaseSchema = schemaName;
    // Helpful links regarding Schemas:
    // Adding schemas to exposed list locally: https://github.com/orgs/supabase/discussions/10428#discussioncomment-4193897
    // Supabase client options to add schema: https://supabase.com/docs/reference/javascript/v0/initializing?example=with-additional-parameters
    // Directions for using custom schemas: https://supabase.com/docs/guides/api/using-custom-schemas
    const options = {
      db: {
        schema: _anonRoleSupabaseSchema,
      },
      auth: {
        persistSession: false, // Setting persistSession to false means that it will use memory instead of a specific storage location.)
      },
    }

    // Note: For RLS to take effect we should use the ANON key. 
    //       Using the SERVICE key bypasses RLS and has complete access to the DB.
    _anonRoleSupabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_ANON_KEY') as string,
      options,
    ) as SupabaseClient;
  }
}

 function initializeServiceRoleSupabase(schemaName = _serviceRoleSupabaseSchema) {
  if (!_serviceRoleSupabase || schemaName !== _serviceRoleSupabaseSchema) {
    _serviceRoleSupabaseSchema = schemaName;
    
    // Helpful links regarding Schemas:
    // Adding schemas to exposed list locally: https://github.com/orgs/supabase/discussions/10428#discussioncomment-4193897
    // Supabase client options to add schema: https://supabase.com/docs/reference/javascript/v0/initializing?example=with-additional-parameters
    // Directions for using custom schemas: https://supabase.com/docs/guides/api/using-custom-schemas
    const options = {
      db: {
        schema: _serviceRoleSupabaseSchema,
      },
      auth: {
        persistSession: false, // Setting persistSession to false means that it will use memory instead of a specific storage location.)
      },
    }

    // Note: For RLS to take effect we should use the ANON key. 
    //       Using the SERVICE key bypasses RLS and has complete access to the DB.

    _serviceRoleSupabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string,
      options,
    ) as SupabaseClient;
  }
}

export async function supabaseSignIn(userCreds: ITestUserCredentials) {
  initializeAnonRoleSupabase();

  try {
    const { data, error } = await _anonRoleSupabase.auth.signInWithPassword({
      email: userCreds.email,
      password: userCreds.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    //return { user: data };
    return {  user: data.user, session: data.session };
  } catch (error) {
    throw new Error('Sign-in failed: ' + error.message);
  }
}

export async function supabaseSignOut() {
  initializeAnonRoleSupabase();

  try {
    const { error } = await _anonRoleSupabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error('Sign-out failed: ' + error.message);
  }
}

export async function getLoggedInUser() {
  initializeAnonRoleSupabase();
  try {
    const {
      data: { user },
    } = await _anonRoleSupabase.auth.getUser();
    return user;
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Deletes a row of data using the Supabase SERVICE ROLE.
 * NOTE: Using the SERVICE ROLE bypasses RLS.
 * Also the SERVICE ROLE does not require and App User to login.
 * SERVICE ROLE is a Postgres Role/User.
 *
 * @export
 * @param {string} table The name of the table.
 * @param {string} column The name of the column.
 * @param {string|number} value Value to search for when deleting.
 * @returns
 */
export async function supabaseDeleteRow(table:string, column:string, value:string|number) {
  const {error, data, count, status, statusText} = await _serviceRoleSupabase
  .from(table)
  .delete()
  .eq(column, value);

  return {error, data, count, status, statusText};
}

export function getSupabaseClient(schemaName?: string) {
  initializeAnonRoleSupabase(schemaName);
  return _anonRoleSupabase;
}

export function getServiceSupabaseClient(schemaName?: string) {
  initializeServiceRoleSupabase(schemaName);
  return _serviceRoleSupabase;
}

function initializeAuthServiceRoleSupabase() {
  if (!_authServiceRoleSupabase) {
    const options = {
      db: {
        schema: 'auth',
      },
      auth: {
        persistSession: false, // Setting persistSession to false means that it will use memory instead of a specific storage location.)
      },
    }

    _authServiceRoleSupabase  = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string,
      options,
    ) as SupabaseClient;
  }
}

export function getAuthServiceSupabaseClient() {
  initializeAuthServiceRoleSupabase();
  return _authServiceRoleSupabase;
}