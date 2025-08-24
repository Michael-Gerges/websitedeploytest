import { create } from '@netlify/blobs';

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let value;
  try {
    const body = JSON.parse(event.body);
    value = body.value;
    if (typeof value !== 'string') {
      throw new Error('Invalid value');
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body', details: err.message }),
    };
  }

  try {
    const blobs = create({ context });
    const logStore = blobs.createClient({ name: 'function-logs' });
    const logEntry = { value, time: new Date().toISOString() };
    await logStore.setJSON(`log-${Date.now()}.json`, logEntry);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to write log', details: err.message }),
    };
  }

  return {
    statusCode: 200,
    body: 'Logged',
  };
}
