import { debug } from './logging.ts';

// Example usage:
// const randomString = genRandomId(10); // Generates a random string of length 10
export function generateRandomId(length: number) {
  debug('helpers.generateRandomId', { length });

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
