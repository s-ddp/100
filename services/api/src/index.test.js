import http from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';

import { createRequestHandler } from './router.js';
import { loadConfig } from './config.js';
import { createLoggerWithLevel } from './logger.js';

async function withServer(handler, fn) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
}

test('health endpoint responds with ok', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.ok(typeof body.uptimeMs === 'number');
  });
});

test('catalog list and detail work', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const listRes = await fetch(`${baseUrl}/catalog?type=excursion`);
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.ok(listBody.total >= 1);
    assert.ok(Array.isArray(listBody.items));

    const firstId = listBody.items[0].id;
    const detailRes = await fetch(`${baseUrl}/catalog/${firstId}`);
    assert.equal(detailRes.status, 200);
    const detailBody = await detailRes.json();
    assert.equal(detailBody.item.id, firstId);
  });
});

test('suppliers endpoint returns supplier list', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/suppliers`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.total >= 1);
    assert.ok(Array.isArray(body.suppliers));
  });
});
