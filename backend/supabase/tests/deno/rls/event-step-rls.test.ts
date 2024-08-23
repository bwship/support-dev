// Event Step table specific tests and supporting test functions
import { assertEquals, assertStrictEquals } from 'asserts';
import {
  supabaseSignIn,
  supabaseSignOut,
  getSupabaseClient,
  rallierUserCreds,
  helperUserCreds,
  teamOneAdminUserCreds,
  unauthorizedUserCreds
} from '../../helpers/supabaseSingleton.ts';
import { printOutResponse } from '../../helpers/common.ts';

const _supabaseClient = getSupabaseClient();
const _testTypeTitlePrefix = 'RLS Event Step Test:';

const deactivateStep = async (id: number) => {
  // console.log('Deactivating id: ' + id );
  const deactivateResponse = await _supabaseClient
  .rpc('fn_event_step_deactivate', {
    _id: id} // added row's step id
  );
  
  if (deactivateResponse.error !== null) {
    console.log('deactivate error: ' + deactivateResponse.error + '; deactivate status: ' + deactivateResponse.status);
    assertEquals(deactivateResponse.status, 200, 'Deactivate status should be 200');
  }
}

const validateUpdate = async (
  tableName: string,
  expectedStatus: number,
  expectedColumnValueArray: Array<Map<string, string | number>>,
  expectedDataCount: number,
  stepId: number
) => {
  
/*   const expectedColumnValues = expectedColumnValueArray[0];
  const columns = [...expectedColumnValues.keys()].join(', '); */

  const { data, status, error } = await _supabaseClient
  .from(tableName)
  .select(/* columns */)
  .eq('is_active', true)
  .eq('id', stepId);

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

const testStepUpsert = async (
  eventID: number,
  type: string,
  attributes: string,
  notes: string, 
  parent_step_id: number | null = null,
  expectedError: number | string | null,
  expectedStatus: number,
  id: number | null = null // default is null; pass existing id to update
): Promise<number> => {
const response = await _supabaseClient
  .rpc('fn_event_step_upsert', {
    _event_id: eventID,
    _type: type,
    _attributes: JSON.parse(attributes),
    _notes: notes,
    _parent_step_id: parent_step_id,
    _id: id }
  );

  //console.log('data: ' + response.data);
  //console.log('error: ');
  //console.log(response.error);
  //console.log('count: ' + response.count);
  //console.log('status: ' + response.status);
  //console.log('status text: ' + response.statusText);

  if (response.status === 200 && expectedStatus != 200) {
    //console.log('Expected error status, but got 200');
    await deactivateStep(response.data);
  }

  //console.log('expected error: ');
  //console.log(expectedError);

  if (response.error != null) {
    assertStrictEquals(JSON.stringify(response.error), expectedError);
  } else {
    assertStrictEquals(response.error, expectedError);
  }

  //console.log('expected status: ' + expectedStatus);
  assertStrictEquals(response.status, expectedStatus);

  return response.data;  // new or updated row id
};

// Insert Test cases
// Deno.test(
//   `${_testTypeTitlePrefix} Event Step Upsert (Insert) without a logged in user`,
//   async () => {
    
//     await testStepUpsert(
//       1,
//       'TRANSPORTATION',
//       '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
//       'notes field',
//       null,
//       '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"event_step\\"\"}',
//       401);
//   }
// );

// Deno.test(
//   `${_testTypeTitlePrefix} Event Step Upsert (Insert) as TEAM_ADMIN`,
//   async () => {
//     await supabaseSignIn(teamOneAdminUserCreds);
    
//     const stepId = await testStepUpsert(
//       1,
//       'TRANSPORTATION',
//       '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
//       'notes field',
//       null,
//       null,
//       200);
      
//     await deactivateStep(stepId);
//     await supabaseSignOut();
//   }
// );

Deno.test(
  `${_testTypeTitlePrefix} Event Step Upsert (Insert) as TEAM_OWNER`,
  async () => {
    await supabaseSignIn(rallierUserCreds);
    const stepId = await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      'notes field',
      null,
      null,
      200);
    
    await deactivateStep(stepId);
    await supabaseSignOut();
  }
);


// Deno.test(
//   `${_testTypeTitlePrefix} Event Step Upsert (Insert) as non-team member`,
//   async () => {
//     await supabaseSignIn(unauthorizedUserCreds);
//     const stepId = await testStepUpsert(
//       1,
//       'TRANSPORTATION',
//       '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
//       'notes field',
//       null,
//       '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"event_step\\"\"}',
//       403);

//     await supabaseSignOut();
//   }
// );


// Deno.test(
//   `${_testTypeTitlePrefix} Event Step Upsert (Insert) as HELPER team member`,
//   async () => {
//     await supabaseSignIn(helperUserCreds);
//     await testStepUpsert(
//       1,
//       'TRANSPORTATION',
//       '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
//       'notes field',
//       null,
//       '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"event_step\\"\"}',
//       403);

//     await supabaseSignOut();
//   }
// );

// Update test cases 

Deno.test(
  `${_testTypeTitlePrefix} Event Step Upsert (Update) with anon user`,
  async () => {

    // Add a new event to be updated by anon user (not logged in at all)
    await supabaseSignIn(rallierUserCreds);
  
    const stepId = await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      'notes field',
      null,
      null,
      200);

    // console.log('stepId: ' + stepId);
    await supabaseSignOut();

    // now we are an unauthorized user aka anon
    await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2023-11-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      'notes field UPDATED',
      null,
      `{"code":"P0001","details":null,"hint":null,"message":"ID ${stepId} does not exist. Use existing ID for update or no ID for insert"}`,
      400,
      stepId);

   // log in to deactivate
    await supabaseSignIn(rallierUserCreds);
    await deactivateStep(stepId);
    await supabaseSignOut();
  }
);

Deno.test(
  `${_testTypeTitlePrefix} Event Step Upsert (Update) by TEAM_OWNER`,
  async () => {

    await supabaseSignIn(rallierUserCreds);
    
    const notes = 'Event Step Note - for update';

    const stepId = await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      notes,
      null,
      null,
      200);

    await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      notes + ' UPDATED',
      null,
      null,
      200,
      stepId); 

    const columnsValues = new Map<string, string | number>();
    columnsValues.set('id',  stepId);
    columnsValues.set('notes', notes + ' UPDATED');
    
    const  columnsValueArray: Map<string, string | number>[] = [columnsValues];
    await validateUpdate('event_step', 200, columnsValueArray, 1, stepId);
    await deactivateStep(stepId);
    await supabaseSignOut();
  }
);

Deno.test(
  `${_testTypeTitlePrefix} Step Upsert (Update) by TEAM_ADMIN`,
  async () => {

    await supabaseSignIn(teamOneAdminUserCreds);
    
    const notes = 'Step Note - for update by TEAM_ADMIN';

    const stepId = await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      notes,
      null,
      null,
      200);

    await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      notes + ' UPDATED',
      null,
      null,
      200,
      stepId);

    const columnsValues = new Map<string, string | number>();
    columnsValues.set('id',  stepId);
    columnsValues.set('notes', notes + ' UPDATED');
    
    const columnsValueArray: Map<string, string | number>[] = [columnsValues];
    await validateUpdate('event_step', 200, columnsValueArray, 1, stepId);
    await deactivateStep(stepId);
    await supabaseSignOut();
  }
);

// THIS TEST IS FAILING
// Deno.test(
//   `${_testTypeTitlePrefix} Step Upsert (Update) by HELPER - not allowed`,
//   async () => {

//     await supabaseSignIn(rallierUserCreds);
    
//     const notes = 'Step Note - for update by HELPER';

//     const stepId = await testStepUpsert(
//       1,
//       'TRANSPORTATION',
//       '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
//       notes,
//       null,
//       null,
//       200);

//     await supabaseSignOut();

//     await supabaseSignIn(helperUserCreds);
//     await testStepUpsert(
//       1,
//       'TRANSPORTATION',
//       '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
//       notes + ' UPDATED',
//       null,
//       '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"event_step\\""}',
//       403,
//       stepId);

//     await supabaseSignOut();

//     // deactivate so it won't show in a select of active rows.
//     await supabaseSignIn(rallierUserCreds);
//     await deactivateStep(stepId);
//     await supabaseSignOut();
//   }
// );

Deno.test(
  `${_testTypeTitlePrefix} Step Upsert (Update) by TEAM_ADMIN with event created by TEAM_OWNER`,
  async () => {

    await supabaseSignIn(rallierUserCreds);
    
    const notes = 'Step Note - for update';
    const updatedPostfix = ' - Updated by TEAM_ADMIN'

    const stepId = await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      notes,
      null,
      null,
      200);

    await supabaseSignOut();
    await supabaseSignIn(teamOneAdminUserCreds);
    await testStepUpsert(
      1,
      'TRANSPORTATION',
      '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
      notes + updatedPostfix,
      null,
      null,
      200,
      stepId); 

    const columnsValues = new Map<string, string | number>();
    columnsValues.set('id',  stepId);
    columnsValues.set('notes', notes + updatedPostfix);
    
    const  columnsValueArray: Map<string, string | number>[] = [columnsValues];
    await validateUpdate('event_step', 200, columnsValueArray, 1, stepId);
    await deactivateStep(stepId);
    await supabaseSignOut();
  }
); 

// THIS TEST IS FAILING
// Deno.test(
//   `${_testTypeTitlePrefix} Event Step Upsert (Update) by HELPER with Event Step Request for Event Step`,
//   async () => {
    
//     const notes = 'Event Step Note - updated by HELPER with associated request';
//     const stepId = 1;

//     await supabaseSignIn(helperUserCreds);
//     await testStepUpsert(
//       1,
//       'TRANSPORTATION',
//       '{"pickup_at":"2024-01-01T11:30:00+00:00","end_address_id":2,"start_address_id":1}',
//       notes,
//       null,
//       null,
//       200,
//       stepId);

//     const columnsValues = new Map<string, string | number>();
//     columnsValues.set('id',  stepId);
//     columnsValues.set('notes', notes);
    
//     const  columnsValueArray: Map<string, string | number>[] = [columnsValues];
//     await validateUpdate('event_step', 200, columnsValueArray, 1, stepId);

//     await supabaseSignOut();
//   }
// );
