type AnyObject = { [key: string]: any };

function snakeToCamel(s: string): string {
  return s.replace(/(_\w)/g, (match) => match[1].toUpperCase());
}

export function convertObjectKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((value) => convertObjectKeysToCamelCase(value));
  } else if (typeof obj === 'object' && obj !== null) {
    const result: AnyObject = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = snakeToCamel(key);
        result[camelKey] = convertObjectKeysToCamelCase(obj[key]);
      }
    }

    return result;
  } else {
    return obj;
  }
}
