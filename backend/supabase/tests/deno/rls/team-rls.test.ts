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
const testName = 'RLS Team Table Test:';

Deno.test(`${testName} select a team when NOT logged in`, async () => {
  const { data, error, status } = await _supabaseClient
    .from('team')
    .select()

  printOutResponse(data, status, error);

  assertEquals(status, 200);
  assertEquals(data, []);
});

Deno.test(`${testName} select own team when logged in`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('team')
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

Deno.test(`${testName} select non-teammate's team when logged in`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('team')
    .select()
    .eq('id', teamTwoAdminUserCreds.profile_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);
  assertEquals(data, []);
});

/*
Deno.test(`${testName} create a team for oneself`, async () => {
  fail('Write test - this should pass');
});

Deno.test(`${testName} create a team for someone else`, async () => {
  fail('Write test - this should fail');
});

Deno.test(`${testName} update a team for oneself`, async () => {
  fail('Write test - this should pass');
});

Deno.test(`${testName} update a team for someone else`, async () => {
  fail('Write test - this should fail');
});

Deno.test(`${testName} delete my team`, async () => {
  fail('Write test - this should fail');
});

Deno.test(`${testName} delete someone else's team`, async () => {
  fail('Write test - this should fail');
});
*/