import { assertEquals, assertNotEquals } from 'asserts';
import {
  getSupabaseClient,
  helperUserCreds,
  rallierUserCreds,
  supabaseSignIn,
  supabaseSignOut,
  unauthorizedUserCreds,
} from '../../helpers/supabaseSingleton.ts';

// deno-lint-ignore no-unused-vars
import { printOutResponse } from '../../helpers/common.ts';

const _supabaseClient = getSupabaseClient();
const testName = 'RLS Address Table Test:';

Deno.test(`${testName} Unauthorized Missing Authorization`, async () => {
  const { data, error, status } = await _supabaseClient
    .from('address')
    .select()
    .eq('profile_id', rallierUserCreds.profile_id);

  printOutResponse(data, status, error);

  assertEquals(data, []);
  assertEquals(status, 200);
});

Deno.test(`${testName} Unauthorized Invalid Authorization`, async () => {
  await supabaseSignIn(unauthorizedUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('address')
    .select()
    .eq('profile_id', rallierUserCreds.profile_id);

  printOutResponse(data, status, error);

  assertEquals(data, []); // Should return an empty array.
  assertEquals(status, 200);
  assertEquals(error, null); // Even though the user is not authorized no error is returned.

  await supabaseSignOut();
});

Deno.test(`${testName} Authorized`, async () => {
  await supabaseSignIn(rallierUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('address')
    .select()
    .eq('profile_id', rallierUserCreds.profile_id);

  printOutResponse(data, status, error);

  assertNotEquals(data, null);
  assertEquals(status, 200);
  assertEquals(error, null);

  await supabaseSignOut();
});

Deno.test(`${testName} Authorized Helper Access`, async () => {
  await supabaseSignIn(helperUserCreds);

  const { data, error, status } = await _supabaseClient
    .from('address')
    .select()
    .eq('profile_id', rallierUserCreds.profile_id);

  printOutResponse(data, status, error);

  assertNotEquals(data, null);
  assertEquals(status, 200);
  assertEquals(error, null);

  await supabaseSignOut();
});
