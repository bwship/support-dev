// Event table specific tests and supporting test functions
import { assertEquals, assertStrictEquals } from 'asserts';
import {
  supabaseSignIn,
  supabaseSignOut,
  supabaseDeleteRow,
  getSupabaseClient,
  getServiceSupabaseClient,
  rallierUserCreds,
  helperUserCreds,
  unauthorizedUserCreds,
  teamOneAdminUserCreds
} from '../../helpers/supabaseSingleton.ts';

// deno-lint-ignore no-unused-vars
import { printOutResponse } from '../../helpers/common.ts';

const _supabaseAnonClient = getSupabaseClient();
getServiceSupabaseClient(); // Initialize the Service Role User needed to delete data after tests.
const _testTypeTitlePrefix = 'RLS Event Test:';

const deactivateEvent = async (id: number) => {
  // console.log('Deactivating id: ' + id );

  const deactivateResponse = await _supabaseAnonClient
    .rpc('fn_event_deactivate', {
      _event_id: id} // added row's event id
    );

  if (deactivateResponse.error !== null) {
    console.log('deactivate error: ' + deactivateResponse.error + '; delete status: ' + deactivateResponse.status);
  }
}

const validateUpdate = async (
  tableName: string,
  expectedHttpStatus: number,
  expectedColumnValueArray: Array<Map<string, string | number>>,
  expectedDataCount: number,
  eventId: number
) => {
  
/*   const expectedColumnValues = expectedColumnValueArray[0];
  const columns = [...expectedColumnValues.keys()].join(', ');; */

  const { data, status, error } = await _supabaseAnonClient
    .from(tableName)
    .select(/* columns */)
    .eq('is_active', true)
    .eq('id', eventId);

  printOutResponse(data, status, error);

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

const deleteRow = async (table:string, column: string, value:string|number) => {
  // USE SERVICE ROLE TO BYPASS RLS AND DELETE THE TEST DATA WE CREATED.
  console.log('CLEANUP DATA AFTER INSERTING!!!!!!!!!!!!!!!')
  const deleteResponse = await supabaseDeleteRow(table, column, value);
  assertStrictEquals(deleteResponse.error, null, 'Expected error to be null after delete.');
  assertStrictEquals(deleteResponse.data, null, 'Expected error to be null after delete.');
  assertStrictEquals(deleteResponse.status, 204, 'Expected status to be 204 after delete.');
}

const testEventUpsert = async (
  name: string,
  description: string,
  startDate: string,
  teamId: number,
  expectedError: number | string | null,
  expectedHttpStatus: number,
  id: number | null = null, // default is null; pass existing id to update,
  deleteRowAfterUpsert = false
): Promise<number> => {
  const response = await _supabaseAnonClient.rpc('fn_event_upsert', {
    _name: name,
    _description: description,
    _start_date: startDate,
    _team_id: teamId,
    _id: id
  });

  // console.log('Data: ', response.data);
  // console.log('Error: ', response.error);
  // console.log('Count: ', response.count);
  // console.log('Status: ', response.status);
  // console.log('Status Text: ', response.statusText);
  
  if (response.data && deleteRowAfterUpsert) {
    await deleteRow('event', 'id', response.data);
  }

  if (response.error != null) {
    assertStrictEquals(JSON.stringify(response.error), expectedError);
  } else {
    assertStrictEquals(response.error, expectedError);
  }

  assertStrictEquals(response.status, expectedHttpStatus);

  return response.data;  // new or updated row id
};

// Insert Test cases
Deno.test(`${_testTypeTitlePrefix} Event Upsert (Insert) without a logged in user`, async () => {
  await testEventUpsert('Event - Not Logged', 'Event Description - Not Logged in', "2023-10-27",
                        2,
                        '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"event\\"\"}',
                        401);
});

Deno.test(`${_testTypeTitlePrefix} Event Upsert (Insert) as TEAM_ADMIN`, async () => {
  await supabaseSignIn(teamOneAdminUserCreds);
  
  await testEventUpsert('Event Name -  as TEAM_ADMIN', 'Event Description', "2023-10-27",
                                        2, null, 200, null, true);

  await supabaseSignOut();
});

Deno.test(`${_testTypeTitlePrefix} Event Upsert (Insert) as TEAM_OWNER`, async () => {
  await supabaseSignIn(rallierUserCreds);
  
  await testEventUpsert('Event Name - Upsert as TEAM_OWNER', 'Event Description', "2023-10-27", 
                                        2, null, 200, null, true);

  await supabaseSignOut();
});

Deno.test(`${_testTypeTitlePrefix} Event Upsert (Insert) as non-team member`, async () => {
  await supabaseSignIn(unauthorizedUserCreds);
  
  await testEventUpsert('Event Name - Upsert as non-team member', 'Event Description', "2023-10-27", 2,
  '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"event\\"\"}',403);

  await supabaseSignOut();
});

Deno.test(`${_testTypeTitlePrefix} Event Upsert (Insert) as HELPER team member`, async () => {
  await supabaseSignIn(helperUserCreds);
  
  await testEventUpsert('Event Name - Event Upsert (Insert) as HELPER team member', 'Event Description', "2023-10-27", 2, 
  '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"event\\"\"}',403);

  await supabaseSignOut();
});

// Update test cases 
Deno.test(`${_testTypeTitlePrefix} Event Upsert (Update) without a logged in user`, async () => {
  // Add a new event to be updated by anon user (not logged in at all)
  await supabaseSignIn(rallierUserCreds);

  // First Insert the data.
  const eventId = await testEventUpsert('Event for Update', 'Event Description - for update by anon test', "2023-10-31",
                                        2, null, 200);
  // console.log('eventID: ' + eventId);
  await supabaseSignOut();

  // now we are an unauthorized user
  await testEventUpsert('Event for Update', 'Event Description - UPDATED by anon user', "2023-10-31",
                        2, `{"code":"P0001","details":null,"hint":null,"message":"ID ${eventId} does not exist"}`,
                        400, eventId);  // if anon is able to insert, the event will be deactivated

  // Data Cleanup
  await deleteRow('event', 'id', eventId);
});

Deno.test(`${_testTypeTitlePrefix} Event Upsert (Update) by TEAM_OWNER`, async () => {
  await supabaseSignIn(rallierUserCreds);
  
  const description = 'Event Description - for update';

  // First Insert the data.
  const eventId = await testEventUpsert('Event for Update', description, "2023-10-31",
                                        2, null, 200);

  // Now test updating the data.
  await testEventUpsert('Event for Update', description + ' UPDATED', "2023-10-31",
                        2, null, 200, eventId); 

  const columnsValues = new Map<string, string | number>();
  columnsValues.set('id',  eventId);
  columnsValues.set('description', description + ' UPDATED');
  
  const  columnsValueArray: Map<string, string | number>[] = [columnsValues];
  await validateUpdate('event', 200, columnsValueArray, 1, eventId);
  await supabaseSignOut();

  // Data Cleanup
  await deleteRow('event', 'id', eventId);
});

Deno.test(`${_testTypeTitlePrefix} Event Upsert (Update) by TEAM_ADMIN`, async () => {
  await supabaseSignIn(teamOneAdminUserCreds);
  
  const description = 'Event Description - for update by TEAM_ADMIN';

  // First Insert the data.
  const eventId = await testEventUpsert('Event for Update', description, "2023-10-31",
                                        2, null, 200);

  // Now test updating the data.
  await testEventUpsert('Event for Update', description + ' UPDATED', "2023-10-31",
                        2, null, 200, eventId);

  const columnsValues = new Map<string, string | number>();
  columnsValues.set('id',  eventId);
  columnsValues.set('description', description + ' UPDATED');
  
  const columnsValueArray: Map<string, string | number>[] = [columnsValues];
  await validateUpdate('event', 200, columnsValueArray, 1, eventId);
  await supabaseSignOut();

  // Data Cleanup
  await deleteRow('event', 'id', eventId);
});

Deno.test(`${_testTypeTitlePrefix} Event Upsert (Update) by HELPER`, async () => {
  await supabaseSignIn(rallierUserCreds);
  
  const description = 'Event Description - for update by HELPER';
  // First Insert the data.
  const eventId = await testEventUpsert('Event for Update', description, "2023-10-31",
                                        2, null, 200);
  await supabaseSignOut();
  
  await supabaseSignIn(helperUserCreds);
  
  // Now test updating the data.
  await testEventUpsert('Event for Update', description + ' UPDATED', "2023-10-31",
                        2,
                        `{"code":"P0001","details":null,"hint":null,"message":"ID ${eventId} does not exist"}`,
                        400,
                        eventId);

  await supabaseSignOut();

  // Data Cleanup
  await deleteRow('event', 'id', eventId);
});

Deno.test(`${_testTypeTitlePrefix} Event Upsert (Update) by TEAM_ADMIN with event created by TEAM_OWNER`, async () => {
  await supabaseSignIn(rallierUserCreds);
  
  const description = 'Event Description - for update';
  const updatedPostfix = ' - Updated by TEAM_ADMIN'
  // First Insert the data.
  const eventId = await testEventUpsert('Event for Update', description, "2023-10-31", 2, null, 200);

  await supabaseSignOut();

  await supabaseSignIn(teamOneAdminUserCreds);
  // Now test updating the data.
  await testEventUpsert('Event for Update', description + updatedPostfix, "2023-10-31",
                        2, null, 200, eventId); 

  const columnsValues = new Map<string, string | number>();
  columnsValues.set('id',  eventId);
  columnsValues.set('description', description + updatedPostfix);
  
  const  columnsValueArray: Map<string, string | number>[] = [columnsValues];
  await validateUpdate('event', 200, columnsValueArray, 1, eventId);
  await supabaseSignOut();

  // Data Cleanup
  await deleteRow('event', 'id', eventId);
});
