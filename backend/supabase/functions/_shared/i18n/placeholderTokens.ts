import { debug } from '../helpers/logging.ts';
import { IEvent, IStep } from '../event/index.ts';
import { IProfile } from '../profile/index.ts';
import { formatDate } from '../helpers/formatDate.ts';
import i18n from '../i18n/i18n.ts';

export function placeholderTokens(event?: IEvent, step?: IStep, helper?: IProfile, client?: IProfile) {
  debug('notifications.resolveBrackets');
  
  const t = i18n();
  
  return {
    'eventStartDate': formatDate(event?.startDate) || 'eventStartDate',
    'eventName': event?.name || 'eventName',
    'stepType': t(step?.type || 'stepType'),
    'helperFirstName': helper?.firstName || 'helperFirstName',
    'helperLastName': helper?.lastName || 'helperLastName',
    'clientFirstName': client?.firstName || 'clientFirstName',
    'clientLastName': client?.lastName || 'clientLastName'
  }
}
