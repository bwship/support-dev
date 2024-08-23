import { debug } from '../helpers/logging.ts';
import { INotificationMapItem } from '../notifications/index.ts';
import { getTeamMembers, Role } from '../profile/index.ts';
import { IEvent, IStep, IRequest } from './index.ts';
import { NotificationPurpose, NotificationStatus, searchNotifications } from '../notifications/index.ts';

export async function sendStepReminders(event: IEvent, step: IStep, stepRequests: IRequest[], notifications: Map<string, INotificationMapItem[]>) {
  debug('events.sendStepReminders', { event, step, stepRequests });

  if (!stepRequests.length) {
    debug('no requests found, exiting gracefully');
    return;
  }

  const teamMembers = await getTeamMembers(event.teamId);
  const clientProfile = teamMembers.find(t => t.roles.includes(Role.CLIENT));

  if (!clientProfile) {
    throw 'Client profile does not exist.';
  }

  for (const request of stepRequests) {
    const helperProfile = teamMembers.find(m => m.id == request.profileId);

    if (!helperProfile) {
      throw `events.sendStepReminders - Helper profile does not exist. ${request.profileId}`;
    }

    // Check if already sent notification in the past 24 hours
    const currentDate = new Date(); // Get the current date and time
    const oneDaysAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    const items = await searchNotifications(undefined,
                                            helperProfile.id,
                                            NotificationStatus.SENT,
                                            undefined,
                                            oneDaysAgo.toUTCString(),
                                            currentDate.toUTCString());

    if (!items.length) {
      const key = JSON.stringify([helperProfile.id, NotificationPurpose.STEP_REMINDER]);

      notifications.set(key, [...(notifications.get(key) || []), {
        purpose: NotificationPurpose.STEP_REMINDER,
        event,
        step,
        clientProfile: clientProfile,
        helperProfile: helperProfile,
        requestId: request.id,
      }]);
    }
  }
}
