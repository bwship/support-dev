import { assertEquals, assertStrictEquals } from 'asserts';
import {
  supabaseSignIn,
  supabaseSignOut,
  getSupabaseClient,
  rallierUserCreds,
  helperUserCreds,
  unauthorizedUserCreds,
  teamOneAdminUserCreds,
  teamTwoAdminUserCreds,

  randomClientUserCreds,
  randomTeamOwnerUserCreds,
  randomTeamAdminUserCreds,
  randomHelperUserCreds
} from '../../helpers/supabaseSingleton.ts';

// deno-lint-ignore no-unused-vars
import { printOutResponse } from '../../helpers/common.ts';

const _supabaseClient = getSupabaseClient();
const _testTypeTitlePrefix = 'RLS Standard SELECT Test:';

// **** Test Helper Functions ****
// Note: For this test no user should be logged in.
const testMissingAuthorization = async (
  tableName: string,
  columnName: string,
  value: number|string
) => {
  const { data, status, error } = await _supabaseClient
    .from(tableName)
    .select()
    .eq(columnName, value);

  // printOutResponse(data, status, error);

  assertEquals(error, null, `Table: ${tableName}; Error is not null.`);
  assertEquals(data, [], `Table: ${tableName}; Data should be an empty array.`);
  assertEquals(
    status,
    200,
    `Table: ${tableName}; Expected status 200, got ${status}.`
  );
};

// Note: This test requires a logged in user that does NOT have Authorized Access.
const testUnauthorizedUser = async (
  tableName: string,
  columnName: string,
  value: number | string
) => {
  const { data, status, error } = await _supabaseClient
    .from(tableName)
    .select()
    .eq(columnName, value);

  // printOutResponse(data, status, error);

  assertEquals(
    data,
    [],
    `Table: ${tableName}; Data should have been an empty array.`
  ); // Should return an empty array.

  assertEquals(
    status,
    200,
    `Table: ${tableName}; Expected status: 200 got: ${status}.`
  );
  assertEquals(error, null, `Table: ${tableName}; Expected error to be null.`); // Even though the user is not authorized no error is returned.
};

// Note: This test requires an Authorized User.
const testAuthorizedUser = async (
  tableName: string,
  columnName: string,
  value: number | string,
  expectedDataCount: number
) => {
  const { data, status, error } = await _supabaseClient
    .from(tableName)
    .select()
    .eq(columnName, value);

  // printOutResponse(data, status, error);

  if (Array.isArray(data)) {
    // Assert that it has more than one value
    assertStrictEquals(
      data.length, expectedDataCount,
      `Table: ${tableName}; Data expected count: ${expectedDataCount} got: ${data.length}.`
    );
  } else {
    // Handle the case where data is null or undefined
    assertEquals(data, null, `Table: ${tableName}; Data is null or undefined.`);
  }

  assertEquals(
    status,
    200,
    `Table: ${tableName}; Expected status: 200 got: ${status}.`
  );
  assertEquals(error, null, `Table: ${tableName}; Expected error to be null.`);
};

// Method to test select * behavior with select policies
const testSelectStarResults = async (
  tableName: string,
  expectedHttpStatus: number,
  expectedColumnValueArray: Array<Map<string, string | number>>,
  expectedDataCount: number
) => {
  //const columns = [...expectedColumnValues.keys()].join(', ');;

  const { data, status, error } = await _supabaseClient
  .from(tableName)
  .select(/*columns*/)
  .eq('is_active', true);

  // printOutResponse(data, status, error);

  assertEquals(
    status,
    expectedHttpStatus,
    `Table: ${tableName}; Expected status: ${expectedHttpStatus} got: ${status}.`
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

// **** Test Functions ****
// ******************************************************************
// Unauthorized Missing Authorization Tests (No user is logged in)

Deno.test(
  `${_testTypeTitlePrefix} Unauthorized Missing Authorization`,
  async () => {
    await testMissingAuthorization('address', 'profile_id', rallierUserCreds.profile_id);
    await testMissingAuthorization('team', 'id', rallierUserCreds.team_id as number);
    await testMissingAuthorization('config', 'id', 'DENO_TESTS');
    await testMissingAuthorization('event', 'id', 1);
    await testMissingAuthorization('event_processing', 'id', 1);
    await testMissingAuthorization('event_step', 'id', 1);
    await testMissingAuthorization('event_step_request', 'id', 1);
    await testMissingAuthorization('event_step_request', 'id', 1);
    await testMissingAuthorization('profile', 'id', rallierUserCreds.profile_id);
    await testMissingAuthorization('profile_location', 'profile_id', rallierUserCreds.profile_id);
    await testMissingAuthorization('relationship', 'id', 2);
    await testMissingAuthorization('config', 'id', 'DENO_TESTS');

    // Note: Only authenticated users can view lookup tables.
    await testMissingAuthorization('lookup_address_type', 'id', 'DOCTOR');
    await testMissingAuthorization('lookup_event_processing_status', 'id', 'PENDING');
    await testMissingAuthorization('lookup_family_member_type', 'id', 'GREAT_GRANDFATHER');
    await testMissingAuthorization('lookup_invite_status', 'id', 'INVITED');
    await testMissingAuthorization('lookup_notification_channel', 'id', 'PUSH');
    await testMissingAuthorization('lookup_notification_status', 'id', 'FAILED');
    await testMissingAuthorization('lookup_pet_type', 'id', 'SNAKE');
    await testMissingAuthorization('lookup_step_type', 'id', 'MEAL');
    await testMissingAuthorization('lookup_transportation_rule', 'id', 'WHEEL_CHAIR_ACCESSIBLE');
  }
);

// ******************************************************************
// Unauthorized Invalid Authorization Tests (User logged in but does not have access to the data)

Deno.test(
  `${_testTypeTitlePrefix} Unauthorized Invalid Authorization`,
  async () => {
    await supabaseSignIn(unauthorizedUserCreds);
    await testUnauthorizedUser('address', 'profile_id', rallierUserCreds.profile_id);
    await testUnauthorizedUser('team', 'id', rallierUserCreds.team_id as number);
    await testUnauthorizedUser('event', 'id', 1);
    await testUnauthorizedUser('event_processing', 'id', 1);
    await testUnauthorizedUser('event_step', 'id', 1);
    await testUnauthorizedUser('event_step_request', 'id', 1);
    await testUnauthorizedUser('profile', 'id', rallierUserCreds.profile_id);
    await testUnauthorizedUser('profile_location', 'profile_id', rallierUserCreds.profile_id);
    // await testUnauthorizedUser('config', 'id', 'DENO_TESTS'); // PROBLEM!!!
    await testUnauthorizedUser('relationship', 'id', 2);

    // Note: Every authenticated user should be able to view lookup tables.
    // Note: This is using the "authorized" test on purpose because
    //       even though this user is not authorized to view data 
    //       in the previous tests this user is authorized to view lookup tables.
    await testAuthorizedUser('lookup_address_type', 'id', 'DOCTOR', 1);
    await testAuthorizedUser('lookup_event_processing_status', 'id', 'PENDING', 1);
    await testAuthorizedUser('lookup_family_member_type', 'id', 'GREAT_GRANDFATHER', 1);
    await testAuthorizedUser('lookup_invite_status', 'id', 'INVITED', 1);
    await testAuthorizedUser('lookup_notification_channel', 'id', 'PUSH', 1);
    await testAuthorizedUser('lookup_notification_status', 'id', 'FAILED', 1);
    await testAuthorizedUser('lookup_pet_type', 'id', 'SNAKE', 1);
    await testAuthorizedUser('lookup_step_type', 'id', 'MEAL', 1);
    await testAuthorizedUser('lookup_transportation_rule', 'id', 'WHEEL_CHAIR_ACCESSIBLE', 1);  

    await supabaseSignOut();

    //-------
    // Test that the helper user belonging to team 1 can't access any data from team 2.
    await supabaseSignIn(helperUserCreds);
    await testUnauthorizedUser('address', 'profile_id', teamTwoAdminUserCreds.profile_id);
    await testUnauthorizedUser('team', 'id', teamTwoAdminUserCreds.team_id as number);
    await testUnauthorizedUser('profile', 'id', teamTwoAdminUserCreds.profile_id);
    await testUnauthorizedUser('profile_location', 'profile_id', teamTwoAdminUserCreds.profile_id);
    await supabaseSignOut();

    await supabaseSignIn(randomTeamAdminUserCreds);
    await testUnauthorizedUser('address', 'profile_id', teamTwoAdminUserCreds.profile_id);
    await testUnauthorizedUser('profile', 'id', teamTwoAdminUserCreds.profile_id);
    await testUnauthorizedUser('profile_location', 'profile_id', teamTwoAdminUserCreds.profile_id);
    await supabaseSignOut();

  }
);

// ******************************************************************
// Authorized User Tests

Deno.test(
  `${_testTypeTitlePrefix} Authorized Rallier Access`,
  async () => {
    await supabaseSignIn(rallierUserCreds);

    await testAuthorizedUser('address', 'profile_id', rallierUserCreds.profile_id, 2);
    await testAuthorizedUser('team', 'id', rallierUserCreds.team_id as number, 1);
    await testAuthorizedUser('event', 'id', 1, 1);
    await testAuthorizedUser('event_processing', 'id', 1, 0);
    await testAuthorizedUser('event_step', 'id', 1, 1);
    await testAuthorizedUser('event_step_request', 'id', 1, 1);
    await testAuthorizedUser('event_step_request', 'id', 1, 1);
    await testAuthorizedUser('profile', 'id', rallierUserCreds.profile_id, 1);  // User should be able to access own profile.
    await testAuthorizedUser('profile_location', 'profile_id', rallierUserCreds.profile_id, 1);
    await testAuthorizedUser('relationship', 'id', 2, 1);
    await testAuthorizedUser('config', 'id', 'DENO_TESTS', 1);

    // Note: Every authenticated user should be able to view lookup tables.
    await testAuthorizedUser('lookup_address_type', 'id', 'DOCTOR', 1);
    await testAuthorizedUser('lookup_event_processing_status', 'id', 'PENDING', 1);
    await testAuthorizedUser('lookup_family_member_type', 'id', 'GREAT_GRANDFATHER', 1);
    await testAuthorizedUser('lookup_invite_status', 'id', 'INVITED', 1);
    await testAuthorizedUser('lookup_notification_channel', 'id', 'PUSH', 1);
    await testAuthorizedUser('lookup_notification_status', 'id', 'FAILED', 1);
    await testAuthorizedUser('lookup_pet_type', 'id', 'SNAKE', 1);
    await testAuthorizedUser('lookup_step_type', 'id', 'MEAL', 1);
    await testAuthorizedUser('lookup_transportation_rule', 'id', 'WHEEL_CHAIR_ACCESSIBLE', 1); 
    await supabaseSignOut();

    await supabaseSignIn(randomClientUserCreds);
    await testAuthorizedUser('address', 'profile_id', randomClientUserCreds.profile_id, 1);
    await testAuthorizedUser('profile', 'id', randomClientUserCreds.profile_id, 1);
    await testAuthorizedUser('profile_location', 'profile_id', randomClientUserCreds.profile_id, 1);
    await supabaseSignOut();

    await supabaseSignIn(randomTeamOwnerUserCreds);
    await testAuthorizedUser('address', 'profile_id', randomTeamOwnerUserCreds.profile_id, 1);
    await testAuthorizedUser('profile', 'id', randomTeamOwnerUserCreds.profile_id, 1);
    await testAuthorizedUser('profile_location', 'profile_id', randomTeamOwnerUserCreds.profile_id, 1);
    await supabaseSignOut();

    await supabaseSignIn(randomTeamAdminUserCreds);
    await testAuthorizedUser('address', 'profile_id', randomTeamAdminUserCreds.profile_id, 1);
    await testAuthorizedUser('profile', 'id', randomTeamAdminUserCreds.profile_id, 1);
    await testAuthorizedUser('profile_location', 'profile_id', randomTeamAdminUserCreds.profile_id, 1);
    await supabaseSignOut();

    await supabaseSignIn(randomHelperUserCreds);
    await testAuthorizedUser('address', 'profile_id', randomHelperUserCreds.profile_id, 1);
    await testAuthorizedUser('profile', 'id', randomHelperUserCreds.profile_id, 1);
    await testAuthorizedUser('profile_location', 'profile_id', randomHelperUserCreds.profile_id, 1);
    await supabaseSignOut();
  }
);

// ******************************************************************
// Authorized Team/Helper User Tests

Deno.test(
  `${_testTypeTitlePrefix} Authorized Team Helper Access`,
  async () => {
    await supabaseSignIn(helperUserCreds);
    await testAuthorizedUser('address', 'profile_id', rallierUserCreds.profile_id, 2);
    // await testAuthorizedUser('address', 'profile_id', helperUserCreds.profile_id, 1);
    await testAuthorizedUser('team', 'id', rallierUserCreds.team_id as number, 1);
    await testAuthorizedUser('event', 'id', 1, 1);
    await testAuthorizedUser('event_processing', 'id', 1, 0);
    await testAuthorizedUser('event_step', 'id', 1, 1);
    await testAuthorizedUser('event_step_request', 'id', 1, 1);
    await testAuthorizedUser('profile', 'id', helperUserCreds.profile_id, 1);   // User should be able to access own profile.
    await testAuthorizedUser('profile', 'id', rallierUserCreds.profile_id, 1);  // User should be able to access event owner profile.
    await testAuthorizedUser('profile_location', 'profile_id', rallierUserCreds.profile_id, 1);
    // await testAuthorizedUser('profile_location', 'profile_id', helperUserCreds.profile_id, 1);
    // await testAuthorizedUser('config', 'key', 'DENO_TESTS', 1);
    await testAuthorizedUser('relationship', 'id', 2, 1); 

    // Note: Every authenticated user should be able to view lookup tables.
    await testAuthorizedUser('lookup_address_type', 'id', 'DOCTOR', 1);
    await testAuthorizedUser('lookup_event_processing_status', 'id', 'PENDING', 1);
    await testAuthorizedUser('lookup_family_member_type', 'id', 'GREAT_GRANDFATHER', 1);
    await testAuthorizedUser('lookup_invite_status', 'id', 'INVITED', 1);
    await testAuthorizedUser('lookup_notification_channel', 'id', 'PUSH', 1);
    await testAuthorizedUser('lookup_notification_status', 'id', 'FAILED', 1);
    await testAuthorizedUser('lookup_pet_type', 'id', 'SNAKE', 1);
    await testAuthorizedUser('lookup_step_type', 'id', 'MEAL', 1);
    await testAuthorizedUser('lookup_transportation_rule', 'id', 'WHEEL_CHAIR_ACCESSIBLE', 1); 
    await supabaseSignOut();
  }
);

Deno.test(
  `${_testTypeTitlePrefix} Authorized Team Helper Select without Where`,
  async () => {
    await supabaseSignIn(helperUserCreds);
    const columnsValues = new Map<string, string | number>();
    columnsValues.set('id',  1);
    columnsValues.set('name', 'Radiation');
    
    const columnsValueArray: Map<string, string | number>[] = [columnsValues];

    await testSelectStarResults('event', 200, columnsValueArray, 1);

    await supabaseSignOut();
  }
);

Deno.test(
  `${_testTypeTitlePrefix} Authorized Team Rallier (Owner) Select without Where`,
  async () => {
    await supabaseSignIn(rallierUserCreds);
    const columnsValues = new Map<string, string | number>();
    columnsValues.set('id',  1);
    columnsValues.set('name', 'Radiation');

    const columnsValueArray: Map<string, string | number>[] = [columnsValues];

    await testSelectStarResults('event', 200, columnsValueArray, 1);

    await supabaseSignOut();
  }
);

// Deno.test(
//   `${_testTypeTitlePrefix} Team Id 2 Owner Select without Where`,
//   async () => {
//     await supabaseSignIn(teamTwoAdminUserCreds);

//     const columnsValues = new Map<string, string | number>();
//     columnsValues.set('id',  1);
//     const columnsValueArray: Map<string, string | number>[] = [columnsValues];
//     await testSelectStarResults('event', 200, columnsValueArray, 1);

//     await supabaseSignOut();
//   }
// );

// Deno.test(
//   `${_testTypeTitlePrefix} Team Id 1 Not logged in -  Select without Where`,
//   async () => {
//     const columnsValues = new Map<string, string | number>();
//     columnsValues.set('id',  1);
//     columnsValues.set('name', 'Radiation');
//     const columnsValueArray: Map<string, string | number>[] = [columnsValues];
//     await testSelectStarResults('event', 401, columnsValueArray, 0);
//   }
// );

// Deno.test(
//   `${_testTypeTitlePrefix} Team Id 1 Team Admin Select without Where`,
//   async () => {
//     await supabaseSignIn(teamOneAdminUserCreds);
//     const columnsValues = new Map<string, string | number>();
//     columnsValues.set('id',  1);
//     columnsValues.set('name', 'Radiation');
//     const columnsValueArray: Map<string, string | number>[] = [columnsValues];

//     await testSelectStarResults('event', 200, columnsValueArray, 1);

//     await supabaseSignOut();
//   }
// );
