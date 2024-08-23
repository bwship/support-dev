import { Ref } from 'vue'

export function formatDate(dateString: string, locale = 'en-US'): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const date = dateString.length == 10 ? new Date(`${dateString}T00:00:00`) : new Date(dateString)

  return `${date.toLocaleDateString(locale, options)}`
}

export function formatTime(dateString: string, locale = 'en-US'): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }

  const date = dateString.length == 10 ? new Date(`${dateString}T00:00:00`) : new Date(dateString)

  return date.toLocaleTimeString(locale, options)
}

export function parseAndSetDateTime(
  attribute: string | null | undefined,
  dateField: Ref<string>,
  timeField: Ref<string>
) {
  if (attribute) {
    const dateTime = parseDateTime(attribute)
    dateField.value = dateTime.date
    timeField.value = dateTime.time
  }
}

export function timeAgo(pastDate: string | undefined | null) {
  if (!pastDate) return ''
  const now = new Date()
  const seconds = Math.floor((now.getTime() - new Date(pastDate).getTime()) / 1000)

  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  const year = day * 365

  if (seconds < minute) {
    return `${seconds}s`
  } else if (seconds < hour) {
    return `${Math.floor(seconds / minute)}m`
  } else if (seconds < day) {
    return `${Math.floor(seconds / hour)}h`
  } else if (seconds < month) {
    return `${Math.floor(seconds / day)}d`
  } else if (seconds < year) {
    const months = Math.floor(seconds / month)
    return months <= 12 ? `${months}mo` : `${Math.floor(months / 12)}y`
  } else {
    return `${Math.floor(seconds / year)}y`
  }
}

export function toLocalString(date: Date) {
  const pad = (num: number) => (num < 10 ? '0' + num : num)

  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

export function toISOString(date: Date) {
  const pad = (num: number) => (num < 10 ? '0' + num : num)

  return (
    date.getUTCFullYear() +
    '-' +
    pad(date.getUTCMonth() + 1) +
    '-' +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    ':' +
    pad(date.getUTCMinutes()) +
    ':' +
    pad(date.getUTCSeconds()) +
    '+00:00'
  )
}

export function toCamelCaseWithSpaces(input: string): string {
  return input
    .replace(/_([a-z])/g, (match, letter) => ` ${letter.toUpperCase()}`)
    .replace(/^([a-z])/, (match, letter) => letter.toUpperCase())
}

export function parseDateTime(dateTimeString: string): { date: string; time: string } {
  // Parse the string into a Date object
  const parsedDate = new Date(dateTimeString)

  // Format the date component
  const year = parsedDate.getFullYear()
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0')
  const day = parsedDate.getDate().toString().padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`

  // Format the time component
  const hours = parsedDate.getHours().toString().padStart(2, '0')
  const minutes = parsedDate.getMinutes().toString().padStart(2, '0')
  const formattedTime = `${hours}:${minutes}`

  return { date: formattedDate, time: formattedTime }
}

export const dateRules = [
  (value: string) => !!value || 'Date is required',
  (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) || 'Date must be in the format YYYY-MM-DD',
  (value: string) => {
    const parts = value.split('-')
    if (parts.length === 3) {
      const month = parseInt(parts[1])
      const day = parseInt(parts[2])
      if (month < 1 || month > 12) {
        return 'Month must be between 01 and 12'
      }
      if (day < 1 || day > 31) {
        return 'Day must be between 01 and 31'
      }
      return true
    }
    return false
  },
]

export const dateRulesFuture = [
  ...dateRules, // Include all existing rules
  (value: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to midnight for accurate comparison
    const selectedDate = new Date(`${value}T00:00:00`)
    return selectedDate >= today || 'Date must be in the future'
  },
]

export const timeRules = [
  (value: string) => !!value || 'Time is required',
  (value: string) => /^\d{2}:\d{2}(:\d{2})?$/.test(value) || 'Time must be in the format HH:MM or HH:MM:SS',
  (value: string) => {
    const parts = value.split(':')
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10)
      const seconds = parts.length === 3 ? parseInt(parts[2], 10) : null

      if (hours < 0 || hours > 23) {
        return 'Hour must be between 00 and 23'
      }
      if (minutes < 0 || minutes > 59) {
        return 'Minute must be between 00 and 59'
      }
      if (seconds !== null && (seconds < 0 || seconds > 59)) {
        return 'Second must be between 00 and 59'
      }
      return true
    }
    return false
  },
]

export function readableDate(dateInput: Date) {
  const date = new Date(dateInput)

  if (isNaN(date.getTime())) {
    // Checking if the date is invalid
    return '' // Return an empty string or some default value
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // If the hour '0' should be '12'

  return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`
}
