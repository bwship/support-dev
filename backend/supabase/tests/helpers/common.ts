import { PostgrestError } from 'https://esm.sh/v132/@supabase/postgrest-js@1.8.4/dist/module/types.js';

// Note: For this function to work make sure to export the following:
//  ex: $ export RBY_TEST_PRINT_RESPONSE="true"

export function printOutResponse (
  data: any[] | null,
  status: number,
  error: PostgrestError | null
) {
  const printResponse = Boolean(Deno.env.get('RBY_TEST_PRINT_RESPONSE'));
  if (printResponse == true) {
    console.log('DATA: ', data);
    console.log('STATUS: ', status);
    console.log('ERROR: ', error);
  }
}
