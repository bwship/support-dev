import { create, get, update, sync } from '../../functions/_shared/hubspot/contact.ts';
import { assertEquals, assertNotEquals } from 'asserts';

const testCreateContact = async () => {
  const profile = {
      id: 1, 
      attributes: {}, 
      isActive: true,
      firstName: 'Support',
      lastName: 'Tester',
      email: 'support.tester@support.dev',
      phone: '+12223334444',
      userId: 'e8e36347-2eb2-40f3-b6f6-050b7b23e618',
      updatedBy: 'c8848ef9-bcd4-4e48-acec-1cca09001d77',
      profileUrl: '', 
      roles: [], 
      createdAt: new Date('2024-01-23T22:05:18.319Z')
  };

  const response = await create(profile);
  console.log('TEST CREATE RESPONSE', response);
  assertNotEquals(response?.id, null);
};

const testUpdateContact = async () => {
  const profile = {
    id: 1, 
    attributes: {}, 
    isActive: true,
    firstName: 'Chester',
    lastName: 'Tester',
    email: 'support2.tester@support.dev',
    phone: '+12223334444',
    userId: 'c8848ef9-bcd4-4e48-acec-1cca09001d77',
    updatedBy: 'e8e36347-2eb2-40f3-b6f6-050b7b23e618',
    profileUrl: '', 
    roles: [], 
    createdAt: new Date('2024-01-23T22:05:18.319Z')
  };

  const response = await update('2601', profile);
  console.log('TEST UPDATE RESPONSE', response);
  assertNotEquals(response?.id, null);
}

const testGetContactThatDoesntExist = async () => {
  const response = await get('ZZZZZZZZ-2eb2-40f3-b6f6-050b7b23e618');
  console.log('TEST GET Contact that doesnt exist', response);
  assertEquals(response?.status, 'COMPLETE');
  assertEquals(response?.results.length, 0);
  assertEquals(response?.numErrors, 1);
};

const testGetContactBy_RBY_ID = async () => {
  const response = await get('e8e36347-2eb2-40f3-b6f6-050b7b23e618');
  console.log('TEST GET BY RBY ID RESPONSE', response);
  assertEquals(response?.status, 'COMPLETE');
  assertEquals(response?.results.length, 1);
};

const testGetContactBy_Email = async () => {
  const response = await get('john.doe@support.dev', 'email');
  console.log('TEST GET BY EMAIL RESPONSE', response);
  assertEquals(response?.status, 'COMPLETE');
  assertEquals(response?.results.length, 1);
};

const testSyncContact = async () => {
  const profile = {
    id: 1, 
    attributes: {}, 
    isActive: true,
    firstName: 'Sync',
    lastName: 'Tester',
    email: 'support.tester@support.dev',
    phone: '+12223334444',
    userId: 'e8e36347-2eb2-40f3-b6f6-050b7b23e618',
    updatedBy: 'c8848ef9-bcd4-4e48-acec-1cca09001d77',
    profileUrl: '', 
    roles: [], 
    createdAt: new Date('2024-01-23T22:05:18.319Z')
  };

  const response = await sync(profile);
  console.log('TEST SYNC RESPONSE', response);
  assertNotEquals(response?.id, null);
}

await Deno.test(
  'HubSpot Data Sync Test',
  async () => {
    // await testCreateContact();
    // await testUpdateContact();
    // await testGetContactThatDoesntExist();
    // await testGetContactBy_RBY_ID();
    // await testGetContactBy_Email();
    await testSyncContact();
  }
)
