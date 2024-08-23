type AnyObject = { [key: string]: any; };

function camelToSnake(s: string): string {
  return s.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function convertObjectKeysToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(value => convertObjectKeysToSnakeCase(value));
  } else if (typeof obj === 'object' && obj !== null) {
    const result: AnyObject = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = camelToSnake(key);
        result[snakeKey] = convertObjectKeysToSnakeCase(obj[key]);
      }
    }

    return result;
  } else {
    return obj;
  }
}
