addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * @typedef {Object} AuthorizedUser
 * @property {string} user - The username of the authorized user.
 * @property {string} token - The authorization token.
 * @property {string} [comment] - An optional comment associated with the user.
 */

/**
 * @type {AuthorizedUser[]}
 */
const AUTHORIZED_USERS = env.AUTHORIZED_USERS;

// Main request handler
async function handleRequest(request) {
  const { method, url } = request;
  const path = new URL(url).pathname.split('/').filter(Boolean);

  // Basic authentication check
  const authHeader = request.headers.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!AUTH_TOKENS.has(token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Determine action based on requests
  const action = path[0];

  switch (action) {
    case 'get':
      return await handleGet(path.slice(1), method);
    case 'put':
      return await handlePut(path.slice(1), request, method, token);
    case 'delete':
      return await handleDelete(path.slice(1), method);
    case 'history':
      return await handleHistory(path.slice(1), method);
    case 'list':
      return await handleList(path.slice(1), method, token);
    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

// GET function
async function handleGet(params, method) {
  if (method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const [collection, key] = params;

  if (!collection || !key) {
    return new Response('Missing collection or key', { status: 400 });
  }

  const data = await MY_KV_STORE.get(`${collection}:${key}`);

  if (!data) {
    return new Response('Not Found', { status: 404 });
  }

  const { objects, _logs } = JSON.parse(data);
  const visibleVersions = objects.filter(version => !version._hidden);

  if (visibleVersions.length === 0) {
    return new Response('Not Found', { status: 404 });
  }

  // Remove _hidden property from the response
  const responseObj = { ...visibleVersions[visibleVersions.length - 1] };
  delete responseObj._hidden;

  return new Response(JSON.stringify(responseObj), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// PUT function
async function handlePut(params, request, method, userToken) {
  if (method !== 'PUT') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const [collection, key] = params;

  if (!collection || !key) {
    return new Response('Missing collection or key', { status: 400 });
  }

  const newValue = await request.json();

  if (!newValue || typeof newValue !== 'object') {
    return new Response('Invalid payload', { status: 400 });
  }

  const currentData = await MY_KV_STORE.get(`${collection}:${key}`);
  const versionHistory = currentData ? JSON.parse(currentData) : { objects: [], _logs: [] };

  // Append new value with _hidden = false
  versionHistory.objects.push({ ...newValue, _hidden: false });

  // Log the operation
  const logEntry = {
    method: 'PUT',
    user: userToken,  // Store the authenticated username
    time: Date.now()  // Current time in UNIX timestamp
  };
  versionHistory._logs.push(logEntry);

  await MY_KV_STORE.put(`${collection}:${key}`, JSON.stringify(versionHistory));

  return new Response('Created', { status: 201 });
}

// DELETE function
async function handleDelete(params, method) {
  if (method !== 'DELETE') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const [collection, key] = params;

  if (!collection || !key) {
    return new Response('Missing collection or key', { status: 400 });
  }

  const currentData = await MY_KV_STORE.get(`${collection}:${key}`);

  if (!currentData) {
    return new Response('Not Found', { status: 404 });
  }

  const versionHistory = JSON.parse(currentData);

  // Mark all versions as hidden
  const updatedHistory = versionHistory.objects.map(version => ({ ...version, _hidden: true }));
  versionHistory.objects = updatedHistory;

  await MY_KV_STORE.put(`${collection}:${key}`, JSON.stringify(versionHistory));

  // Log the delete operation
  const logEntry = {
    method: 'DELETE',
    user: userToken, // Store the authenticated username
    time: Date.now()  // Current time in UNIX timestamp
  };
  versionHistory._logs.push(logEntry);
  await MY_KV_STORE.put(`${collection}:_logs`, JSON.stringify(versionHistory));

  return new Response('Deleted', { status: 204 });
}

// HISTORY function
async function handleHistory(params, method) {
  if (method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const [collection, key] = params;

  if (!collection || !key) {
    return new Response('Missing collection or key', { status: 400 });
  }

  const currentData = await MY_KV_STORE.get(`${collection}:${key}`);

  if (!currentData) {
    return new Response('Not Found', { status: 404 });
  }

  const { _logs } = JSON.parse(currentData);
  
  return new Response(JSON.stringify(_logs), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// LIST function
async function handleList(params, method, userToken) {
  if (method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const collection = params[0];

  if (!collection) {
    return new Response('Missing collection', { status: 400 });
  }

  const keys = await MY_KV_STORE.list({ prefix: `${collection}:` });
  const results = [];

  for (const { name } of keys.keys) {
    const data = await MY_KV_STORE.get(name);
    if (data) {
      const { objects } = JSON.parse(data);
      const visibleVersions = objects.filter(version => !version._hidden);
      if (visibleVersions.length > 0) {
        // Return the latest visible version without _hidden property
        const latestVersion = { ...visibleVersions[visibleVersions.length - 1] };
        delete latestVersion._hidden;
        results.push({ key: name.replace(`${collection}:`, ''), value: latestVersion });
      }
    }
  }

  // Log the list operation
  const logEntry = {
    method: 'LIST',
    user: userToken,
    time: Date.now()
  };
  
  const logKey = `${collection}:_logs`;
  const logData = await MY_KV_STORE.get(logKey);
  const logs = logData ? JSON.parse(logData) : { objects: [], _logs: [] };
  logs._logs.push(logEntry);
  await MY_KV_STORE.put(logKey, JSON.stringify(logs));

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}