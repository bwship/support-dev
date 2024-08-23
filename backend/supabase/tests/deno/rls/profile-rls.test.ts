import { assertEquals, assertStrictEquals, fail } from 'asserts';
import {
  getSupabaseClient,
  systemAdminUserCreds,
  helperUserCreds,
  rallierUserCreds,
  supabaseSignIn,
  supabaseSignOut,
  teamOneAdminUserCreds,
  teamTwoAdminUserCreds,
  getServiceSupabaseClient,
  supabaseDeleteRow,
  getAuthServiceSupabaseClient,
  bobsTeamAdminUser,
  bobsTeamOwnerNotClientUser,
  ITestUserCredentials
} from '../../helpers/supabaseSingleton.ts';

// deno-lint-ignore no-unused-vars
import { printOutResponse } from '../../helpers/common.ts';

const _supabaseClient = getSupabaseClient();
const _supabaseServiceRoleClient = getServiceSupabaseClient();
const _authSupabaseServiceRoleClient = getAuthServiceSupabaseClient();
const testName = 'RLS Profile Table Test:';

const testProfileRelationshipUpsert = async (
  userId: string | null,
  parentProfileID: number | null, 
  firstName: string, 
  lastName: string, 
  roles: string[],
  teamId: number | null,  // pass null if you want a new team
  expectedError: string | JSON | null, 
  expectedStatus: number,
  profileAttributes: string | null = null, 
  profileUrl: string | null = null,
  relationshipAttributes: string | null = null, 
  id: number | null = null
): Promise<number> => {
  const { data, error, count, status, statusText } = await _supabaseClient
  .rpc('fn_profile_and_relationship_upsert', {
    _user_id: userId,
    _parent_profile_id: parentProfileID,
    _id: id,
    _profile_attributes: profileAttributes,
    _relationship_attributes: relationshipAttributes,
    _first_name: firstName,
    _last_name: lastName,
    _profile_url: profileUrl,
    _roles: roles,
    _team_id: teamId
  });

  printOutResponse(data, status, error);

  if (error != null) {
    assertStrictEquals(JSON.stringify(error), expectedError);
  } else {
    assertStrictEquals(error, expectedError);
  }
  
  console.log('expected status: ' + expectedStatus);
  assertStrictEquals(status, expectedStatus);

  return data;  // should be new or existing profile id
};

const createUser = async (
  emailAddress: string, 
  password: string
  ): Promise<string> => {
    console.log('Creating user: ' + emailAddress);

    const {data, error } =  await _supabaseClient.auth.signUp({
      email: emailAddress,
      password: password,
    });

    if (error != null) {
      fail('error should be null: ' + error);
    }

    if (data == null || data.user == null) {
      fail('data or data.user is null');
    } else {
      return data.user.id;  // new user id
    }

    return 'errorHappened';  // tired, not sure how to deal with missing return error 
    // without getting error about possbile null error on data or data.user
};

async function deleteUser(userId: string) {
  // delete the user for the userId using the auth schema service role client
  const { error } = await _authSupabaseServiceRoleClient.auth.admin.deleteUser(userId);
  assertEquals(error, null, 'user deletion should return null error');
}

const validateUpdate = async (
  tableName: string,
  expectedStatus: number,
  expectedColumnValueArray: Array<Map<string, string | number | string[]>>,
  expectedDataCount: number,
  idName: string,
  id: number
) => {

  const { data, status, error } = await _supabaseClient
  .from(tableName)
  .select()
  .eq('is_active', true)
  .eq(idName, id);

  printOutResponse(data, status, error);

  assertEquals(
    status,
    expectedStatus,
    `Table: ${tableName}; Expected status: ${expectedStatus} got: ${status}.`
  );

  if (Array.isArray(data)) {
    // Assert that it has more than one value
    assertStrictEquals(
      data.length,
      expectedDataCount,
      `Table: ${tableName}; Data expected count: ${expectedDataCount} got: ${data.length}.`
    );

    // Check the values of the returned columns
    data.forEach(function (row, index) {
      const valueMap = expectedColumnValueArray[index];
      for (const [key, value] of valueMap.entries()) {
        assertEquals(row[key], value, `Table: ${tableName}; ${key} is ${value}.`);
      }
    });

  } else {
    // Handle the case where data is null or undefined
    assertEquals(data, null, `Table: ${tableName}; Data is null or undefined.`);
  }
};


/* 
These select test are duplicated in standard-select-rls.test.ts
select a profile when NOT logged in
select own profile when logged in
select teammate's profile when logged in
select non-teammate's profile when logged in
*/
Deno.test(`${testName} select a profile when NOT logged in`, async () => {
  const { data, error, status } = await _supabaseClient
    .from('profile')
    .select()

  printOutResponse(data, status, error);

  assertEquals(status, 200);
  assertEquals(data, []);
});

Deno.test(`${testName} select own profile when logged in`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('profile')
    .select()
    .eq('id', rallierUserCreds.profile_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);

  if (data !== null && data[0] !== undefined) {
    assertEquals(data[0]?.id, rallierUserCreds.profile_id);
  } else {
    fail('Data is null or undefined');
  }
  await supabaseSignOut();
});

Deno.test(`${testName} select teammate's profile when logged in`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('profile')
    .select()
    .eq('id', helperUserCreds.profile_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);

  if (data !== null && data[0] !== undefined) {
    assertEquals(data[0]?.id, helperUserCreds.profile_id);
  } else {
    fail('Data is null or undefined');
  }
  await supabaseSignOut();
});

Deno.test(`${testName} select non-teammate's profile when logged in`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('profile')
    .select()
    .eq('id', teamTwoAdminUserCreds.profile_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);
  assertEquals(data, []);
  await supabaseSignOut();
});

// *****************************************************
// Create Profiles for someone else (Insert via upsert)
// *****************************************************
Deno.test(`${testName} create a profile as Client for someone else`, async () => {

  // Create a new user to use for new profile
  const newUserId = await createUser('bob.m.wall+rlsProfileUnitTestClient@gmail.com', 'test123');
  
  await supabaseSignIn(rallierUserCreds);
  // create a new profile and a new team
  const profileId = await testProfileRelationshipUpsert(
    newUserId,
    null,
    'firstname - create a profile as Client',
    'lastName - create a profile as Client',
    ['HELPER'],
    rallierUserCreds.team_id as number,
    null,
    200
  );

  const {data:rdata, error:rerror, status:rstatus} = await supabaseDeleteRow('relationship', 'profile_id', profileId);
  printOutResponse(rdata, rstatus, rerror);
  const {data, error, status} = await supabaseDeleteRow('profile', 'id', profileId);
  printOutResponse(data, status, error);
  await deleteUser(newUserId);
  await supabaseSignOut();
});

Deno.test(`${testName} create a profile as TEAM_OWNER for someone else`, async () => {

  // Create a new user to use for new profile
  const newUserId = await createUser('bob.m.wall+rlsProfileUnitTestOwner@gmail.com', 'test123');
  
  await supabaseSignIn(bobsTeamOwnerNotClientUser);
  // create a new profile and a new team
  const profileId = await testProfileRelationshipUpsert(
    newUserId,
    null,
    'firstname - create a profile as TEAM_OWNER NOT CLIENT',
    'lastName - create a profile as TEAM_OWNER',
    ['HELPER'],
    bobsTeamOwnerNotClientUser.team_id as number,
    null,
    200
  );

  const {data:rdata, error:rerror, status:rstatus} = await supabaseDeleteRow('relationship', 'profile_id', profileId);
  printOutResponse(rdata, rstatus, rerror);
  const {data, error, status} = await supabaseDeleteRow('profile', 'id', profileId);
  printOutResponse(data, status, error);
  await deleteUser(newUserId);
  await supabaseSignOut();
});

Deno.test(`${testName} create a profile as HELPER for someone else`, async () => {

  // Create a new user to use for new profile
  const newUserId = await createUser('bob.m.wall+rlsProfileUnitTestHelper@gmail.com', 'test123');
  
  await supabaseSignIn(helperUserCreds);
  // create a new profile and a new team
  const expectedError = '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"profile\\""}';

  const profileId = await testProfileRelationshipUpsert(
    newUserId,
    null,
    'firstname - create a profile as HELPER',
    'lastName - create a profile as HELPER',
    ['HELPER'],
    helperUserCreds.team_id as number,
    expectedError,
    403
  );

  await deleteUser(newUserId);
  await supabaseSignOut();
});

Deno.test(`${testName} create a profile as anon for someone else`, async () => {

  // Create a new user to use for new profile
  const newUserId = await createUser('bob.m.wall+rlsProfileUnitTestAnon@gmail.com', 'test123');
  
  const expectedError = '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"profile\\""}';
  await supabaseSignOut();  // make sure we are anon by doing this logout
  // create a new profile and a new team
  const profileId = await testProfileRelationshipUpsert(
    newUserId,
    null,
    'firstname - create a profile as anon',
    'lastName - create a profile as anon',
    ['HELPER'],
    rallierUserCreds.team_id as number,
    expectedError,
    401
  );

  await deleteUser(newUserId);

});

// This test is a warped version of creating a profile for someone else.
// We don't have a user id for family members so the user id won't ever match the row
// user id (which is set to null)
Deno.test(`${testName} create a profile as Client for FAMILY_MEMBER (for someone else)`, async () => {

  
  await supabaseSignIn(rallierUserCreds);
  // create a new profile and a new team
  const profileId = await testProfileRelationshipUpsert(
    null,
    null,
    'Family Member firstname - create a profile as Client',
    'Family Member lastName - create a profile as Client',
    ['FAMILY_MEMBER'],
    rallierUserCreds.team_id as number,
    null,
    200
  );

  const {data:rdata, error:rerror, status:rstatus} = await supabaseDeleteRow('relationship', 'profile_id', profileId);
  printOutResponse(rdata, rstatus, rerror);
  const {data, error, status} = await supabaseDeleteRow('profile', 'id', profileId);
  printOutResponse(data, status, error);
  await supabaseSignOut();
});

// *****************************************************
// Create Profiles for self (Insert via upsert)
// *****************************************************
Deno.test(`${testName} create a Client profile for self`, async () => {

  // Create a new user to use for new profile
  const email = 'bob.m.wall+rlsProfileUnitTestHelper@gmail.com';
  const password = 'test123';
  const newUserId = await createUser(email, password);
  console.log('newUserId: ' + newUserId);
  const creds: ITestUserCredentials = {
    email: email,
    password: password,
    profile_id: -1,
    team_id: -1,
  };
  const {user} = await supabaseSignIn(creds);

  // create a new profile for new user with CLIENT role
  const profileId = await testProfileRelationshipUpsert(
    user.id,
    null,
    'firstname - create a profile as Client',
    'lastName - create a profile as Client',
    ['CLIENT'],//['TEAM_OWNER', 'CLIENT'],
    null,
    null,
    200
  );

  const {data:rdata, error:rerror, status:rstatus} = await supabaseDeleteRow('relationship', 'profile_id', profileId);
  printOutResponse(rdata, rstatus, rerror);
  const {data, error, status} = await supabaseDeleteRow('profile', 'id', profileId);
  printOutResponse(data, status, error);
  await deleteUser(newUserId);
  await supabaseSignOut();
});

/*
TEAM_OWNER isn't able to create a profile as a new users
because the team select policy doesn't allow it.
The test matrix says this should be possible.
See Bob Wall for more information

Deno.test(`${testName} create a profile as TEAM_OWNER`, async () => {

  // Create a new user to use for new profile
  const newUserId = await createUser('bob.m.wall+rlsProfileUnitTestOwner@gmail.com', 'test123');
  
  await supabaseSignIn(bobsTeamOwnerNotClientUser);
  // create a new profile and a new team
  const profileId = await testProfileRelationshipUpsert(
    newUserId,
    null,
    'firstname - create a profile as TEAM_OWNER NOT CLIENT',
    'lastName - create a profile as TEAM_OWNER',
    ['HELPER'],
    bobsTeamOwnerNotClientUser.team_id as number,
    null,
    200
  );

  const {data:rdata, error:rerror, status:rstatus} = await supabaseDeleteRow('relationship', 'profile_id', profileId);
  printOutResponse(rdata, rstatus, rerror);
  const {data, error, status} = await supabaseDeleteRow('profile', 'id', profileId);
  printOutResponse(data, status, error);
  await deleteUser(newUserId);
  await supabaseSignOut();
});
*/
Deno.test(`${testName} create a HELPER profile as self`, async () => {

  // Create a new user to use for new profile
  const email = 'bob.m.wall+rlsProfileUnitTestHelper@gmail.com';
  const password = 'test123';
  const newUserId = await createUser(email, password);
  console.log('newUserId: ' + newUserId);
  const creds: ITestUserCredentials = {
    email: email,
    password: password,
    profile_id: -1,
    team_id: -1,
  };
  const {user} = await supabaseSignIn(creds);
  // create a new profile and a new team
  
  const profileId = await testProfileRelationshipUpsert(
    newUserId,
    null,
    'firstname - create a profile as HELPER',
    'lastName - create a profile as HELPER',
    ['HELPER'],
    null,
    null,
    200
  );

  const {data:rdata, error:rerror, status:rstatus} = await supabaseDeleteRow('relationship', 'profile_id', profileId);
  printOutResponse(rdata, rstatus, rerror);
  const {data, error, status} = await supabaseDeleteRow('profile', 'id', profileId);
  printOutResponse(data, status, error);
  
  await deleteUser(newUserId);
  await supabaseSignOut();
});

Deno.test(`${testName} create a profile as anon`, async () => {

  // Create a new user to use for new profile
  const newUserId = await createUser('bob.m.wall+rlsProfileUnitTestAnon@gmail.com', 'test123');
  
  const expectedError = '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"profile\\""}';
  await supabaseSignOut();  // make sure we are anon by doing this logout
  // create a new profile and a new team
  const profileId = await testProfileRelationshipUpsert(
    newUserId,
    null,
    'firstname - create a profile as anon',
    'lastName - create a profile as anon',
    ['HELPER'],
    null,
    expectedError,
    401
  );

  await deleteUser(newUserId);
});

Deno.test(`${testName} update my own profile`, async () => {
  
  const {user} = await supabaseSignIn(rallierUserCreds);
  const updatedFirstName = "Bob - Updated";
  const updatedLastName = 'Wall - Updated';
  const updatedRoles = ['CLIENT', 'TEAM_OWNER', "TEAM_ADMIN"];

  await testProfileRelationshipUpsert(
    user.id,
    rallierUserCreds.profile_id,
    updatedFirstName,
    updatedLastName,
    updatedRoles,
    rallierUserCreds.team_id ?? null, 
    null,
    200,
    null,
    null,
    null,
    rallierUserCreds.profile_id
  );

  const columnsValues = new Map<string, string | number | string[]>();
  columnsValues.set('id',  rallierUserCreds.profile_id);
  columnsValues.set('first_name', updatedFirstName);
  columnsValues.set('last_name', updatedLastName);

  let columnsValueArray: Map<string, string | number | string[]>[] = [columnsValues];
  await validateUpdate('profile', 200, columnsValueArray, 1, 'id', rallierUserCreds.profile_id);
  
  columnsValues.clear();
  columnsValues.set('profile_id',  rallierUserCreds.profile_id);
  columnsValues.set('roles', updatedRoles);

  columnsValueArray = [columnsValues];
  await validateUpdate('relationship', 200, columnsValueArray, 1, 'profile_id', rallierUserCreds.profile_id);

  await supabaseSignOut();
});

Deno.test(`${testName} update a profile for someone else on the team when TEAM_ADMIN`, async () => {
  const {user} = await supabaseSignIn(rallierUserCreds);
  supabaseSignOut();

  await supabaseSignIn(teamOneAdminUserCreds);
  const updatedFirstName = "Bob - Updated by Admin";
  const updatedLastName = 'Wall - Updated by Admin';
  const updatedRoles = ['CLIENT', 'TEAM_OWNER', "TEAM_ADMIN"];

  
  await testProfileRelationshipUpsert(
    user.id,
    rallierUserCreds.profile_id,
    updatedFirstName,
    updatedLastName,
    updatedRoles,
    rallierUserCreds.team_id ?? null, 
    null,
    200,
    null,
    null,
    null,
    rallierUserCreds.profile_id
  );

  const columnsValues = new Map<string, string | number | string[]>();
  columnsValues.set('id',  rallierUserCreds.profile_id);
  columnsValues.set('first_name', updatedFirstName);
  columnsValues.set('last_name', updatedLastName);

  let columnsValueArray: Map<string, string | number | string[]>[] = [columnsValues];
  await validateUpdate('profile', 200, columnsValueArray, 1, 'id', rallierUserCreds.profile_id);
  
  columnsValues.clear();
  columnsValues.set('profile_id',  rallierUserCreds.profile_id);
  columnsValues.set('roles', updatedRoles);

  columnsValueArray = [columnsValues];
  await validateUpdate('relationship', 200, columnsValueArray, 1, 'profile_id', rallierUserCreds.profile_id);

  await supabaseSignOut();
});

Deno.test(`${testName} update a profile for someone else on the team when TEAM_OWNER`, async () => {
  const {user} = await supabaseSignIn(teamOneAdminUserCreds);
  console.log(user.id);
  supabaseSignOut();

  await supabaseSignIn(rallierUserCreds);
  const updatedFirstName = "Bob's Team Admin - Updated by Owner";
  const updatedLastName = "Bob's Team Admin  - Updated by Owner";
  const updatedRoles = ['TEAM_OWNER', "TEAM_ADMIN"];

  
  await testProfileRelationshipUpsert(
    user.id,
    rallierUserCreds.profile_id,
    updatedFirstName,
    updatedLastName,
    updatedRoles,
    rallierUserCreds.team_id ?? null, 
    null,
    200,
    null,
    null,
    null,
    teamOneAdminUserCreds.profile_id
  );

  const columnsValues = new Map<string, string | number | string[]>();
  columnsValues.set('id',  teamOneAdminUserCreds.profile_id);
  columnsValues.set('first_name', updatedFirstName);
  columnsValues.set('last_name', updatedLastName);

  let columnsValueArray: Map<string, string | number | string[]>[] = [columnsValues];
  await validateUpdate('profile', 200, columnsValueArray, 1, 'id', teamOneAdminUserCreds.profile_id);
  
  columnsValues.clear();
  columnsValues.set('profile_id',  teamOneAdminUserCreds.profile_id);
  columnsValues.set('roles', updatedRoles);

  columnsValueArray = [columnsValues];
  await validateUpdate('relationship', 200, columnsValueArray, 1, 'profile_id', teamOneAdminUserCreds.profile_id);

  await supabaseSignOut();
});

Deno.test(`${testName} update a profile for someone else on the team when HELPER`, async () => {
  
  const {user} = await supabaseSignIn(rallierUserCreds);
  // Get the current firstName, lastName, and roles
  const { data:existingData, error, status } = await _supabaseClient
    .from('profile')
    .select()
    .eq('id', rallierUserCreds.profile_id)
  supabaseSignOut();

  await supabaseSignIn(helperUserCreds);
  const updatedFirstName = "Bob - Updated by Helper";
  const updatedLastName = 'Wall - Updated by Helper';
  const updatedRoles = ['CLIENT', 'TEAM_OWNER', "TEAM_ADMIN"];

  
  await testProfileRelationshipUpsert(
    user.id,
    rallierUserCreds.profile_id,
    updatedFirstName,
    updatedLastName,
    updatedRoles,
    rallierUserCreds.team_id ?? null, 
    null,
    200,
    null,
    null,
    null,
    rallierUserCreds.profile_id
  );

  // Check that the values weren't updated
  if (existingData != null) {
    const columnsValues = new Map<string, string | number | string[]>();
    columnsValues.set('id',  rallierUserCreds.profile_id);
    columnsValues.set('first_name', existingData[0]?.first_name);
    columnsValues.set('last_name', existingData[0]?.last_name);
    columnsValues.set('roles', existingData[0]?.roles);
  
    const columnsValueArray: Map<string, string | number | string[]>[] = [columnsValues];
    await validateUpdate('profile', 200, columnsValueArray, 1, 'id', rallierUserCreds.profile_id);
  } else {
    fail('existingData is null');
  }
  
  await supabaseSignOut();
});

Deno.test(`${testName} update a profile for someone on a different team`, async () => {
  const {user} = await supabaseSignIn(teamTwoAdminUserCreds);
  await supabaseSignOut();
  const {user:rallierUserId} = await supabaseSignIn(rallierUserCreds);
  const updatedFirstName = "Bob - Updated";
  const updatedLastName = 'Wall - Updated';
  const updatedRoles = ['CLIENT', 'TEAM_OWNER', 'TEAM_ADMIN'];

  await testProfileRelationshipUpsert(
    user.id,
    teamTwoAdminUserCreds.profile_id,
    updatedFirstName,
    updatedLastName,
    updatedRoles,
    teamTwoAdminUserCreds.team_id ?? null, 
    null,
    200,
    null,
    null,
    null,
    teamTwoAdminUserCreds.profile_id
  );

  // Login with user we tried to update the profile for to check that no updates happened
  await supabaseSignIn(teamTwoAdminUserCreds);
  const columnsValues = new Map<string, string | number | string[]>();
  columnsValues.set('id',  teamTwoAdminUserCreds.profile_id);
  columnsValues.set('first_name', 'Other');
  columnsValues.set('last_name', "User");

  let columnsValueArray: Map<string, string | number | string[]>[] = [columnsValues];
  await validateUpdate('profile', 200, columnsValueArray, 1, 'id', teamTwoAdminUserCreds.profile_id);
  
  columnsValues.clear();
  columnsValues.set('profile_id',  teamTwoAdminUserCreds.profile_id);
  columnsValues.set('roles', ['CLIENT', 'TEAM_OWNER']);

  columnsValueArray = [columnsValues];
  await validateUpdate('relationship', 200, columnsValueArray, 1, 'profile_id', teamTwoAdminUserCreds.profile_id);

  await supabaseSignOut();
});

/*
Deno.test(`${testName} deactivate my profile`, async () => {
  fail('Write test - this should fail');
});

Deno.test(`${testName} deactivate someone else's`, async () => {
  fail('Write test - this should fail');
});
 */