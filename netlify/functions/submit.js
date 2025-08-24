const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const logFile = path.join(dataDir, 'log.json');

function listFilesystem() {
  try {
    return fs.readdirSync('/');
  } catch (err) {
    return [`Failed to read filesystem: ${err.message}`];
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed', filesystem: listFilesystem() }),
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
      body: JSON.stringify({ error: 'Invalid request body', details: err.message, filesystem: listFilesystem() }),
    };
  }

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    let entries = [];
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8');
      entries = content ? JSON.parse(content) : [];
    }
    entries.push({ value, time: new Date().toISOString() });
    fs.writeFileSync(logFile, JSON.stringify(entries, null, 2));
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to write log', details: err.message, stack: err.stack, filesystem: listFilesystem() }),
    };
  }

  return {
    statusCode: 200,
    body: 'Logged',
  };
};
