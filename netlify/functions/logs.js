import { create } from '@netlify/blobs';

export async function handler(event, context) {
  const blobs = create({ context });
  const logStore = blobs.createClient({ name: 'function-logs' });
  const list = await logStore.list();
  const logs = await Promise.all(
    list.blobs.map((b) => logStore.getJSON(b.key))
  );
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logs, null, 2),
  };
}
