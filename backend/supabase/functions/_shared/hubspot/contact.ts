import { debug } from '../helpers/logging.ts';
import { IProfile } from '../profile/index.ts';

const contactUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
const token = Deno.env.get('HUBSPOT_RBY_USERS_TOKEN');

type HubSpotContactProperties = {
    createdate: Date,
    email: string,
    firstname:string,
    hs_object_id: string,
    lastmodifieddate: Date,
    lastname: string,
    phone: string,
    rby_updated_by_user_id: string,
    rby_user_id: string
}

type HubSpotContact = {
  id: string,
  properties: HubSpotContactProperties,
  createdAt: Date,
  updatedAt: Date,
  archived: boolean
}

type HubSpotContactReponse = {
  status: string,
  results: HubSpotContact[],
  numErrors?: number,
  errors?: [
    {
      status: string,
      category: string,
      message: string,
      context: { ids: [ string ] }
    }
  ],
  startedAt: Date,
  completedAt: Date
}

/**
 * Syncs the Profile object to the HubSpot Contact object.
 *
 * @export
 * @param {IProfile} profile
 * @return {*} 
 */
export async function sync(profile: IProfile) {
  debug('hubspot/contact.sync', { profile });

  // First check to see if this user exists in HubSpot.
  const hubspotContactResponse = await get(profile.userId) as HubSpotContactReponse;
  let upsertResponse;

  if (hubspotContactResponse.results.length === 0) {
    // The contact doesn't exist so we need to create it.
    debug('HubSpot Sync Status: Contact not found in HubSpot. Creating a new HubSpot record.')
    upsertResponse = await create(profile);
  } else {
    // The contact already exists so let's update it.
    debug('HubSpot Sync Status: Contact found in HubSpot. Updating HubSpot record.')
    upsertResponse = await update(hubspotContactResponse.results[0].id, profile);
  }

  debug('HubSpot Sync Status: Complete')

  return upsertResponse;
}

/**
 * Creates a new HubSpot Contact using the Profile object.
 *
 * @export
 * @param {IProfile} profile
 * @return {*} 
 */
export async function create(profile: IProfile) {
  // Data to be saved (replace with your own data)
  const contactData = {
    properties: {
      firstname: profile.firstName,
      lastname: profile.lastName,
      email: profile.email,
      phone: profile.phoneNumber,
      rby_user_id: profile.userId,
      rby_updated_by_user_id: profile.updatedBy,
    },
  };

  debug('hubspot.contact.create', contactData);

  const response = await fetch(contactUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contactData),
  });

  let responseBody;

  if (!response.ok) {
    console.log('HubSpot Create Error Response: ', response);
    debug('hubspot.contact.create: response:', response);
    // throw new Error('HubSpot create failed');
  } else {
    responseBody = await response.json();
  }

  return responseBody;
}

/**
 * Gets a HubSpot Contact object.
 *
 * @export
 * @param {string} idPropertyValue
 * @param {string} [idProperty='rby_user_id']
 * @return {*} 
 */
export async function get(idPropertyValue: string, idProperty = 'rby_user_id') {
  const contactData = {
    'properties': [] as HubSpotContactProperties[],
    'idProperty': idProperty,
    'inputs': [
      {
        'id': idPropertyValue
      },
    ]
  };

  debug('hubspot.contact.get', contactData);

  const response = await fetch(contactUrl + '/batch/read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contactData),
  });

  let responseBody;

  if (!response.ok) {
    debug('hubspot.contact.get: response:', response);
  } else {
    responseBody = await response.json();
  }

  return responseBody;
}

/**
 * Updates a HubSpot Contact using the Profile object.
 *
 * @export
 * @param {string} hubSpotRecordID
 * @param {IProfile} profile
 * @return {*} 
 */
export async function update(hubSpotRecordID: string, profile: IProfile) {
  // Data to be saved (replace with your own data)
  const contactData = {
    properties: {
      firstname: profile.firstName,
      lastname: profile.lastName,
      email: profile.email,
      phone: profile.phoneNumber,
      rby_user_id: profile.userId,
      rby_updated_by_user_id: profile.updatedBy,
    },
  };

  debug('hubspot.contact.update', contactData);

  const response = await fetch(`${contactUrl}/${hubSpotRecordID}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contactData),
  });

  let reponseBody;

  if (!response.ok) {
    debug('hubspot.contact.update: response:', response);
  } else {
    reponseBody = await response.json();
  }

  return reponseBody;
}