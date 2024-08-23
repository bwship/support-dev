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
const testName = 'RLS Event Table Test:';

Deno.test(`${testName} select an event when NOT logged in`, async () => {
  const { data, error, status } = await _supabaseClient
    .from('event')
    .select()

  printOutResponse(data, status, error);

  assertEquals(status, 200);
  assertEquals(data, []);
});

Deno.test(`${testName} select an event for one's own team when logged in`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('event')
    .select()
    .eq('team_id', rallierUserCreds.team_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);

  if (data !== null && data[0] !== undefined) {
    assertEquals(data[0]?.team_id, rallierUserCreds.team_id);
  } else {
    fail('Data is null or undefined');
  }
});

Deno.test(`${testName} select an event for someone elses team`, async () => {
  await supabaseSignIn(teamTwoAdminUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('event')
    .select()
    .eq('team_id', rallierUserCreds.team_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);

  assertEquals(data, []);
});

Deno.test(`${testName} select an event for a helper that has an event request`, async () => {
  await supabaseSignIn(helperUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('event')
    .select()
    .eq('team_id', helperUserCreds.team_id)

  printOutResponse(data, status, error);

  assertEquals(status, 200);

  if (data !== null && data[0] !== undefined) {
    assertEquals(data[0]?.team_id, helperUserCreds.team_id);
  } else {
    fail('Data is null or undefined');
  }
});