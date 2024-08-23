import { debug } from '../helpers/logging.ts';
import { getTeamMembers, Role } from '../profile/index.ts';
import { INotificationMapItem, NotificationPurpose } from '../notifications/index.ts';
import {
  EventStatus,
  IEvent,
  IStep,
  IRequest,
  upsertRequest,
} from './index.ts';

export async function sendStepRequests(event: IEvent, step: IStep, requests: IRequest[], notifications: Map<string, INotificationMapItem[]>) {
  debug('events.sendStepRequests', { event, step, requests });

  const teamMembers = await getTeamMembers(event.teamId);
  const clientProfile = teamMembers.find(t => t.roles.includes(Role.CLIENT));

  if (!clientProfile) {
    throw 'client not found';
  }

  const currentInvitedHelperIds = requests.map(r => r.profileId);

  const filteredTeamMembers = teamMembers.filter(m => {
    return (
      m.isActive &&
      m.roles.includes(Role.HELPER) &&
      m.userId &&
      m.relationshipAttributes?.responseTypes?.includes(step.type) &&
      !currentInvitedHelperIds.includes(m.id)
    );
  });

  for (const member of filteredTeamMembers) {
    const requestId = await upsertRequest(step.id, '', member.id, EventStatus.INVITED);
    const key = JSON.stringify([member.id, NotificationPurpose.STEP_ISSUANCE]);

    notifications.set(key, [...(notifications.get(key) || []), {
      purpose: NotificationPurpose.STEP_ISSUANCE,
      event,
      step,
      clientProfile: clientProfile,
      helperProfile: member,
      requestId,
    }]);
  }
}
