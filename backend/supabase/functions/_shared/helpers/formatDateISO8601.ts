export function formatDateISO8601(date: Date) {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1); // getUTCMonth() returns 0-11
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
}