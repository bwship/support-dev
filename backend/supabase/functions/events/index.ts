import { Application, Context, Router } from 'oak';
import { debug } from '../_shared/helpers/index.ts';
import { getUserIdByJwt } from '../_shared/auth/index.ts';
import {
  cloneEvent,
  deactivateEvent,
  processEvent,
  processRequestRanking,
} from '../_shared/event/index.ts';
import { sendMessage } from '../_shared/slack/index.ts';
import { oakCors } from 'oakCors';

const env = Deno.env.get('SUPPORT_ENV');
const port = 8000;
const router = new Router();

router.post('/events/:eventId/steps/:stepId/ranking', async (context: any) => {
  debug('/events/:eventId/step/:stepId/ranking', { context });
  const eventId = context.params.eventId;
  const stepId = context.params.stepId;

  try {
    await processRequestRanking(eventId, stepId);

    context.response.body = true;
  } catch (error) {
    await sendMessage(
      `#support-${env}`,
      `/events/:eventId/step/:stepId/ranking - An error occurred with eventId: ${eventId}, stepId: ${stepId}: ${error}`,
    );

    context.response.body = false;
  }
});

router.post('/events/:eventId/process', async (context: any) => {
  debug('/events/:eventId/process POST', { context });
  const eventId = context.params.eventId;

  try {
    const body = await context.request.body().value;

    await processEvent(eventId, body.event_processing_id);

    context.response.body = true;
  } catch (error) {
    await sendMessage(
      `#support-${env}`,
      `/events/:eventId/process POST - An error occurred with eventId: ${eventId}: ${error.message || error}`,
    );

    context.response.body = false;
  }
});


router.post('/events/:eventId/clone', async (context: any) => {
  debug('/events/:eventId/clone POST', { context });
  const eventId = context.params.eventId;

  try {
    const body = await context.request.body().value;

    // Check if new_date exists in the request body
    if (!body.new_date) {
      throw new Error('new_date is required');
    }
    await cloneEvent(eventId, new Date(body.new_date));

    context.response.body = true;
  } catch (error) {
    await sendMessage(
      `#support-${env}`,
      `/events/:eventId/clone POST - An error occurred with eventId: ${eventId}: ${error.message || error}`,
    );

    context.response.body = false;
  }
});


router.delete('/events/:eventId', async (context: any) => {
  debug('/events/:eventId DELETE', { context });

  const eventId = context.params.eventId;

  try {

    await deactivateEvent(eventId);

    context.response.body = true;
  } catch (error) {
    await sendMessage(
      `#support-${env}`,
      `/events/:eventId DELETE - An error occurred with eventId: ${eventId}: ${error.message || error}`,
    );

    context.response.body = false;
  }
});

const app = new Application();

app.use(async (context: Context, next: () => Promise<unknown>) => {
  const userId = await getUserIdByJwt(context);

  context.state.userId = userId;
  await next();
  delete context.state.userId; // cleanup
});

app.use(oakCors());
app.use(router.allowedMethods());
app.use(router.routes());

await app.listen({ port });
