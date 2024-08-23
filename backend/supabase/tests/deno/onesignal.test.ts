import { sendMessage } from '../../functions/_shared/oneSignal/sendMessage.ts';
import { assertMatch } from 'asserts';

const testGuid = '26035BB6-6841-494B-8B6B-FE83C917097E';

const testPushNotification = async () => {
  const id = await sendMessage('push',  [testGuid], {message: 'Hello, this is a PUSH test from RBY using OneSignal.'});
  const uuidRegEx = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
  assertMatch(id||'', uuidRegEx, 'id should be in expected format');
};

const testSmsNotification = async () => {
  const id = await sendMessage('sms',  [testGuid], {message: 'Hello, this is an SMS test from RBY using OneSignal.'});
  const uuidRegEx = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
  assertMatch(id||'', uuidRegEx, 'id should be in expected format');
};

const testEmailNotification = async () => {
  const id = await sendMessage('email',  [testGuid], {emailPreHeader: 'RBY 1Sig Test', emailSubject: 'RBY Test Email Subject', emailBody: 'Hello, this is an Email test from RBY using OneSignal.'});
  const uuidRegEx = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
  assertMatch(id||'', uuidRegEx, 'id should be in expected format');
};

Deno.test(
  'OneSignal Notification Tests',
  async () => {
    await testPushNotification();
    await testSmsNotification();
    await testEmailNotification();
  }
)
