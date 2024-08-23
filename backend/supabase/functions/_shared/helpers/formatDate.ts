import i18n from "../i18n/i18n.ts";

export function formatDate(inputDate: string | null | undefined): string | null | undefined {
  
  if (!inputDate) {
    return inputDate
  }

  const date = new Date(inputDate);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const t = i18n();
  const dayName = t(days[date.getDay()]);
  const monthName = t(months[date.getMonth()]);
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();

  let suffix = 'th';
  if (dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31) {
    suffix = 'st';
  } else if (dayOfMonth === 2 || dayOfMonth === 22) {
    suffix = 'nd';
  } else if (dayOfMonth === 3 || dayOfMonth === 23) {
    suffix = 'rd';
  }

  return `${dayName} ${monthName} ${dayOfMonth}${suffix}, ${year}`;
}
