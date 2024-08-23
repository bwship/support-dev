import { assertEquals, assertStrictEquals } from 'asserts';
import {
  supabaseSignIn,
  supabaseSignOut,
  getSupabaseClient,
  teamOneAdminUserCreds
} from '../../helpers/supabaseSingleton.ts';
import { printOutResponse } from '../../helpers/common.ts';

const _supabaseClient = getSupabaseClient();
const _testTypeTitlePrefix = 'RLS Lookup Tables Test:';
const tables = [
  'lookup_address_type',
  'lookup_family_member_type',
  'lookup_invite_status',
  'lookup_pet_type',
  'lookup_step_type',
  'lookup_transportation_rule',
  'lookup_event_processing_status',
];

const testLookupTableInsert = async (
  tableName: string,
  valueJson: { [key: string]: any },
  expectedErrorCode: number | string | null,
  expectedStatus: number
) => {

  const { data, status, error } = await _supabaseClient
  .from(tableName)
  .insert(valueJson);

  printOutResponse(data, status, error);

  assertStrictEquals(status, expectedStatus, `Table: ${tableName}: expected status ${expectedStatus}, got ${status}`);

  if (error) {
    assertStrictEquals(error.code, expectedErrorCode, `Table: ${tableName}: expected status ${expectedErrorCode}}, got ${error.code}`);
  } else {
    assertEquals(error, null, `Table: ${tableName}: expected status ${expectedErrorCode}}, got ${error}`)
  }

};

const testLookupTableUpdate = async (
  tableName: string,
  valueJson: { [key: string]: any },
  idValue: string,
  expectedErrorCode: number | string | null,
  expectedStatus: number
) => {

  const { data, status, error } = await _supabaseClient
  .from(tableName)
  .update(valueJson)
  .eq('id', idValue);

  printOutResponse(data, status, error);

  assertStrictEquals(status, expectedStatus, `Table: ${tableName}: expected status ${expectedStatus}, got ${status}`);

  if (error) {
    assertStrictEquals(error.code, expectedErrorCode, `Table: ${tableName}: expected status ${expectedErrorCode}}, got ${error.code}`);
  } else {
    assertEquals(error, expectedErrorCode, `Table: ${tableName}: expected status ${expectedErrorCode}}, got ${error}`)
  }
};

// Insert Test cases
Deno.test(
  `${_testTypeTitlePrefix} Insert into lookup tables as anon user is NOT allowed`,
  async () => {
    const valueJson = { id: 'id-value', description: 'description' };
    const expectedError = '42501';
    const expectedStatus = 401;

    for (const tableName of tables) {
      await testLookupTableInsert(tableName, valueJson, expectedError, expectedStatus);
    }
  }
);

Deno.test(
  `${_testTypeTitlePrefix} Insert into lookup table with an authorized user is NOT allowed`,
  async () => {
    await supabaseSignIn(teamOneAdminUserCreds);
    const valueJson = { id: 'id-value', description: 'description' };
    const expectedError = '42501';
    const expertedStatus = 403;

    for (const tableName of tables) {
      await testLookupTableInsert(tableName, valueJson, expectedError, expertedStatus);
    }

    await supabaseSignOut();
  }
);

// Updates
Deno.test(
  `${_testTypeTitlePrefix} Update into lookup table with anon user is NOT allowed`,
  async () => {
    const valueJson = { description: 'updated description; anon user'};
    const expectedStatus = 204;

    for (const tableName of tables) {
      await testLookupTableUpdate(tableName, valueJson, 'id-value', null, expectedStatus);
    }
  }
);

Deno.test(
  `${_testTypeTitlePrefix} Update into lookup table with an authorized user is NOT allowed`,
  async () => {
    await supabaseSignIn(teamOneAdminUserCreds);

    const valueJson = { description: 'updated description; authorized user' };
    const expectedStatus = 204;

    for (const tableName of tables) {
      await testLookupTableUpdate(tableName, valueJson, 'id-value', null, expectedStatus);
    }

    await supabaseSignOut();
  }
);
