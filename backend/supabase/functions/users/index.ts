import { Application, Context, Router } from 'oak';
import { debug, error } from '../_shared/helpers/index.ts';
import {
  getUserIdByJwt,
  resendRegistrationEmail,
  resetPasswordEmail,
} from '../_shared/auth/index.ts';
import {
  createProfile,
  IProfile,
  resendInvite,
  updateThirdParties,
  updateThirdPartiesEmailOnly,
} from '../_shared/profile/index.ts';
import { oakCors } from 'oakCors';

const port = 8000;
const router = new Router();

router.post('/users', async (context: any) => {
  debug('/users POST', { context });

  try {
    if (!context.request.hasBody) {
      context.throw(415);
    }

    const createdBy = context.state.userId;
    const user: IProfile = await context.request.body().value;

    await createProfile(user, createdBy);

    context.response.body = true;
  } catch (ex) {
    error('/users POST - error creating a new user', { ex });

    // Handle duplicate user error
    if (ex instanceof Error && ex.message === 'User already exists') {
      context.response.status = 409; // Conflict (duplicate resource)
      context.response.body = { error: 'Rallier already exists' };
    } else {
      context.response.status = 500; // Internal Server Error
      context.response.body = { error: 'Internal Server Error' };
    }
  }
});


router.put('/users/:userId/resend-invite', async (context: any) => {
  debug('/users/:userId/resend-invite PUT', { context });

  const createdByUserId = context.state.userId;
  const userId = context.params.userId;
  await resendInvite(userId, createdByUserId);

  context.response.body = true;
});

router.put('/users/:email/reset-password', async (context: any) => {
  debug('/users/:email/reset-password PUT', { context });

  const email = context.params.email;
  await resetPasswordEmail(email);

  context.response.body = true;
});

router.put('/users/:userId/resend-registration-email', async (context: any) => {
  debug('/users/:userId/resend-registration-email PUT', { context });

  const userId = context.params.userId;
  await resendRegistrationEmail(userId);

  context.response.body = true;
});

router.post('/users/:userId/update-third-parties', async (context: any) => {
  debug('/users/:userId/update-third-parties post', { context });

  const updatedByUserId = context.state.userId;
  const userId = context.params.userId;
  await updateThirdParties(userId, updatedByUserId);

  context.response.body = true;
});

router.post('/users/:email/update-third-parties-preregister', async (context: any) => {
  debug('/users/:email/update-third-parties-preregister post', { context });

  const updatedByUserId = context.state.userId;
  const email = context.params.email;
  await updateThirdPartiesEmailOnly(email, updatedByUserId);

  context.response.body = true;
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
