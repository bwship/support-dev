import { assertEquals, fail } from 'asserts';
import {
  getSupabaseClient,
  helperUserCreds,
  rallierUserCreds,
  supabaseSignIn,
  teamTwoAdminUserCreds,
} from '../../helpers/supabaseSingleton.ts';

// deno-lint-ignore no-unused-vars
import { printOutResponse } from '../../helpers/common.ts';

const _supabaseClient = getSupabaseClient();
const testName = 'RLS Relationship Table Test:';

Deno.test(`${testName} select a relationship when NOT logged in`, async () => {
  const { data, error, status } = await _supabaseClient
    .from('relationship')
    .select()

  printOutResponse(data, status, error);

  assertEquals(status, 200);
  assertEquals(data, []);
});

Deno.test(`${testName} select own relationship when logged in`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('relationship')
    .select()
    .eq('id', rallierUserCreds.profile_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);

  if (data !== null && data[0] !== undefined) {
    assertEquals(data[0]?.id, rallierUserCreds.profile_id);
  } else {
    fail('Data is null or undefined');
  }
});

Deno.test(`${testName} select teammate's relationship when logged in as CLIENT/TEAM_ADMIN/TEAM_OWNER`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('relationship')
    .select()
    .eq('id', helperUserCreds.profile_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);

  if (data !== null && data[0] !== undefined) {
    assertEquals(data[0]?.id, helperUserCreds.profile_id);
  } else {
    fail('Data is null or undefined');
  }
});

/*
Deno.test(`${testName} select teammate's relationship when logged in as HELPER`, async () => {
  fail('Write test - shoudl pass');
});
*/

Deno.test(`${testName} select non-teammate's relationship when logged in`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('relationship')
    .select()
    .eq('id', teamTwoAdminUserCreds.profile_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);
  assertEquals(data, []);
});

/*
Deno.test(`${testName} create a relationship for oneself`, async () => {
  fail('Write test - this should pass');
});

Deno.test(`${testName} create a relationship for someone else`, async () => {
  fail('Write test - this should fail');
});

Deno.test(`${testName} update a relationship for oneself`, async () => {
  fail('Write test - this should pass');
});

Deno.test(`${testName} update a relationship for someone else`, async () => {
  fail('Write test - this should fail');
});

Deno.test(`${testName} delete my relationship`, async () => {
  fail('Write test - this should fail');
});

Deno.test(`${testName} delete someone else's relationship`, async () => {
  fail('Write test - this should fail');
});
*/