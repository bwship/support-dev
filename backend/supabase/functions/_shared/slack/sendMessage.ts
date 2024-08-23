import { debug } from '../helpers/logging.ts';

const messageUrl = 'https://slack.com/api/chat.postMessage';
const token = Deno.env.get('SLACK_TOKEN');

interface ISlackServiceResponse {
  ok?: boolean,
  status?: number,
  error?: string,
  warning?: string
}

/**
 * @description sends a message to slack
 * @param channel - the channel to send the message to
 * @param message - the message to send
 * @returns the response back from slack ISlackServiceResponse
 */
export async function sendMessage(channel: string, message: string): Promise<ISlackServiceResponse> {
  debug('slackService.sendMessage', { channel, message });

  const body = `{
    channel: '${channel}',
    text: '${message}'
  }`;

  const response = await fetch(messageUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  
  // This line needs to be here due to this error during testing:
  // error: Leaking resources:
  // - A fetch response body (rid 147) was created during the test, but not consumed during the test.
  // Consume or close the response body `ReadableStream`, e.g `await resp.text()` or `await resp.body.cancel()`.
  await response.text() 

  return response as ISlackServiceResponse;
}
