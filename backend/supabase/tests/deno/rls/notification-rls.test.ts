import { assertEquals, assertStrictEquals } from 'asserts';
import {
  supabaseSignIn,
  supabaseSignOut,
  getSupabaseClient,
  getServiceSupabaseClient,
  teamOneAdminUserCreds
} from '../../helpers/supabaseSingleton.ts';
import { printOutResponse } from '../../helpers/common.ts';

const _supabaseClient = getSupabaseClient();
const _supabaseServiceRoleClient = getServiceSupabaseClient();
const _testTypeTitlePrefix = 'RLS Notification Test:';

const testNotificationInsert = async (
  profileId: number,
  subject: string, 
  content: string,
  channel: string,
  traceback: string,
  expectedError: number | string | null,
  expectedStatus: number,
  useServiceRole = false
): Promise<number> => {
  let activeClient = _supabaseClient;
  if (useServiceRole == true) {
    activeClient = _supabaseServiceRoleClient;
    // console.log('Using service_role client');
  } else {
    // console.log('Using anon client');
  }

  const response = await activeClient
  .rpc('fn_notification_insert', 
  {
    _profile_id: profileId,
    _subject: subject,
    _content: content, 
    _channel: channel, 
    _traceback: traceback
  });

  // console.log(response.data);
  // console.log(response.error);
  // console.log(response.count);
  // console.log(response.status);
  // console.log(response.statusText);

  if (response.error != null) {
    assertStrictEquals(JSON.stringify(response.error), expectedError);
  } else {
    assertStrictEquals(response.error, expectedError);
  }
  
  assertStrictEquals(response.status, expectedStatus);
  
  return response.data;
};

const testNotificationUpdate = async (
  notification_id: number,
  status: string, 
  proof: string,
  expectedError: number | string | null,
  expectedStatus: number,
  useServiceRole = false
) => {
  let activeClient = _supabaseClient;
  if (useServiceRole == true) {
    activeClient = _supabaseServiceRoleClient;
    // console.log('Using service_role client');
  } else {
    // console.log('Using anon client');
  }
  const response = await activeClient
  .rpc('fn_notification_update', 
  {
    _notification_id: notification_id,
    _status: status,
    _proof: proof 
  });

  // console.log(response.data);
  // console.log(response.error);
  // console.log(response.count);
  // console.log(response.status);
  // console.log(response.statusText);

  if (response.error != null) {
    assertStrictEquals(JSON.stringify(response.error), expectedError);
  } else {
    assertStrictEquals(response.error, expectedError);
  }
  
  assertStrictEquals(response.status, expectedStatus);
};

const validateUpdate = async (
  tableName: string,
  expectedStatus: number,
  expectedColumnValueArray: Array<Map<string, string | number | null>>,
  expectedDataCount: number,
  id: number,
  useServiceRole = false,
) => {
  let activeClient = _supabaseClient;
  if (useServiceRole == true) {
    activeClient = _supabaseServiceRoleClient;
    // console.log('Using service_role client');
  } else {
    // console.log('Using anon client');
  }
/*   const expectedColumnValues = expectedColumnValueArray[0];
  const columns = [...expectedColumnValues.keys()].join(', '); */

  const { data, status, error } = await activeClient
  .from(tableName)
  .select(/* columns */)
  .eq('id', id);

  printOutResponse(data, status, error);

  assertEquals(
    status,
    expectedStatus,
    `Table: ${tableName}; Expected status: ${expectedStatus} got: ${status}.`
  );

  if (Array.isArray(data)) {
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

// Insert Test cases
Deno.test(
  `${_testTypeTitlePrefix} Notification Insert with service_role user`,
  async () => {
    
    await testNotificationInsert(
      1,
      'subject',
      'content',
      'PUSH',
      'traceback',
      null,
      200,
      true
    );
  }
);

Deno.test(
  `${_testTypeTitlePrefix} Notification Insert with anon user`,
  async () => {
    
    await testNotificationInsert(
      1,
      'subject',
      'content',
      'PUSH',
      'traceback',
      '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"notification\\""}',
      401
    );
  }
);

Deno.test(
  `${_testTypeTitlePrefix} Notification Insert with authenticated user`,
  async () => {

    await supabaseSignIn(teamOneAdminUserCreds);
    
    await testNotificationInsert(
      1,
      'subject',
      'content',
      'PUSH',
      'traceback',
      '{"code":"42501","details":null,"hint":null,"message":"new row violates row-level security policy for table \\"notification\\""}',
      403
    );

    await supabaseSignOut();
  }
);

// Update Tests
Deno.test(
  `${_testTypeTitlePrefix} Notification Update with service_role user`,
  async () => {

    const notificationId = await testNotificationInsert(
      1,
      'subject',
      'content',
      'PUSH',
      'traceback',
      null,
      200,
      true
    );

    const proof = 'Here is the proof that it was sent'; 
    await testNotificationUpdate(
      notificationId,
      'SENT',
      proof,
      null,
      204,
      true
    );

    const columnsValues = new Map<string, string | number>();
    columnsValues.set('id',  notificationId);
    columnsValues.set('status', 'SENT');
    columnsValues.set('proof', proof);
    
    const  columnsValueArray: Map<string, string | number>[] = [columnsValues];
    await validateUpdate('notification', 200, columnsValueArray, 1, notificationId, true);

  }
);

Deno.test(
  `${_testTypeTitlePrefix} Notification Update with anon user`,
  async () => {

    const notificationId = await testNotificationInsert(
      1,
      'subject',
      'content',
      'PUSH',
      'traceback',
      null,
      200,
      true
    );

    const proof = 'This value should not get set as anon user'; 
    await testNotificationUpdate(
      notificationId,
      'SENT',
      proof,
      null,
      204,
      false
    );

    const columnsValues = new Map<string, string | number | null>();
    columnsValues.set('id',  notificationId);
    columnsValues.set('status', 'PENDING');
    columnsValues.set('proof', null);
    
    const  columnsValueArray: Map<string, string | number | null>[] = [columnsValues];
    await validateUpdate('notification', 200, columnsValueArray, 1, notificationId, true);

  }
);

Deno.test(
  `${_testTypeTitlePrefix} Notification Update with authorized user (TEAM_ADMIN)`,
  async () => {

    const notificationId = await testNotificationInsert(
      1,
      'subject',
      'content',
      'PUSH',
      'traceback',
      null,
      200,
      true
    );

    await supabaseSignIn(teamOneAdminUserCreds);

    const proof = 'This value should not get set as this user'; 
    await testNotificationUpdate(
      notificationId,
      'SENT',
      proof,
      null,
      204,
      false
    );

    const columnsValues = new Map<string, string | number | null>();
    columnsValues.set('id',  notificationId);
    columnsValues.set('status', 'PENDING');
    columnsValues.set('proof', null);
    
    const  columnsValueArray: Map<string, string | number | null>[] = [columnsValues];
    await validateUpdate('notification', 200, columnsValueArray, 1, notificationId, true);

    await supabaseSignOut();

  }
);
