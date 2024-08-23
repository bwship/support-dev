export interface IProfileAttributes {
  dateOfBirth?: string;
  disabilityAccommodationsDescription?: string;
  foodAllergyDescription?: string;
  foodPreferencesDescription?: string;
  receivePushNotificationMessages?: string;
  receiveEmailMessages?: boolean;
  receiveSmsMessages?: boolean;
  transportationRules?: string[]
}

export interface IProfileAttributesRaw {
  date_of_birth?: string;
  disability_accommodations_description?: string;
  food_allergy_description?: string;
  food_preferences_description?: string;
  receive_push_notification_messages?: string;
  receive_email_messages?: boolean;
  receive_sms_messages?: boolean;
  transportation_rules?: string[]
}

export function convertProfileAttributesToRaw(attrs: IProfileAttributes): IProfileAttributesRaw {
  const raw: IProfileAttributesRaw = {};

  if (attrs.dateOfBirth) {
    raw.date_of_birth = attrs.dateOfBirth;
  }
  if (attrs.disabilityAccommodationsDescription) {
    raw.disability_accommodations_description = attrs.disabilityAccommodationsDescription;
  }
  if (attrs.foodAllergyDescription) {
    raw.food_allergy_description = attrs.foodAllergyDescription;
  }
  if (attrs.foodPreferencesDescription) {
    raw.food_preferences_description = attrs.foodPreferencesDescription;
  }
  if (attrs.receivePushNotificationMessages) {
     raw.receive_push_notification_messages = attrs.receivePushNotificationMessages;
  }
  if (attrs.receiveEmailMessages) {
    raw.receive_email_messages = attrs.receiveEmailMessages;
  }
  if (attrs.receiveSmsMessages) {
    raw.receive_sms_messages = attrs.receiveSmsMessages;
  }
  if (attrs.transportationRules && attrs.transportationRules.length > 0) {
    raw.transportation_rules = attrs.transportationRules;
  }

  return raw;
}
