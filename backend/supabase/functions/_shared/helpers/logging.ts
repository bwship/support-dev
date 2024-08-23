export enum LogType {
  DEBUG = 'DEBUG',
  ERROR = 'ERROR',
  INFO = 'INFO',
  WARNING = 'WARNING',
}

const areDebugLogsOn = !!((Deno.env.get('VERBOSE') && Deno.env.get('VERBOSE') === 'true'));

/**
* @description debug log
* @param title the title of the log
* @param data some optional data.
*/
export function debug(title: string, data: string | object | number | [] = {}): boolean {
  if (areDebugLogsOn) {
    console.debug(`🐛 ${title}`); // eslint-disable-line no-console,security-node/detect-crlf
    _logData(data, LogType.DEBUG);
  }

  return true;
}

/**
 * @description error log
 * @param {string} title the title of the log message
 * @param {string|object} data additional data
 */
export function error(title: string, data: string | object | number | [] = {}): boolean {
  console.error(`🆘 ${title}`); // eslint-disable-line no-console,security-node/detect-crlf
  _logData(data, LogType.ERROR);

  return true;
}

/**
 * @description info log
 * @param {string} title the title of the log message
 * @param {string|object} data additional data
 */
export function info(title: string, data: string | object | number | [] = {}): boolean {
  console.info(`ℹ️ ${title}`); // eslint-disable-line no-console,security-node/detect-crlf
  _logData(data, LogType.INFO);

  return true;
}

/**
 * @description warning log. Meaning that it's not a disaster but weird and should be investigated.
 * @param title the title of the log message.
 * @param data optional data object to print out.
 */
export function warning(title: string, data: string | object | number | [] = {}): boolean {
  console.info(`⚠️ ${title}`); // eslint-disable-line no-console,security-node/detect-crlf
  _logData(data, LogType.WARNING);

  return true;
}

function _logData(data: string | object | number | [] = {}, logType: LogType = LogType.DEBUG): boolean {
  if (!data) {
    return false;
  }

  if (Object.keys(data).length === 0 && data.constructor === Object) {
    return false;
  }

  try {
    console.log(`${logType} data`, data); // eslint-disable-line no-console,security-node/detect-crlf
  } catch (error) {
    console.error('Failed to log data', { error }); // eslint-disable-line no-console
    return false;
  }

  return true;
}