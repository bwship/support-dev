export function sendErrorResponse(status: number, message = '') {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function sendResponse(message = '') {
  return new Response(message, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
