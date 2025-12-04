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

test('refund flow respects refundable window', async () => {
  const config = loadConfig();
  const orders = [];
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'), {
    orderStore: orders,
  });

  await withServer(handler, async (baseUrl) => {
    const checkout = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogItemId: 'exc-001',
        fareCode: 'adult',
        quantity: 1,
        customer: { name: 'Test User', email: 'user@example.com', phone: '+79998887766' },
      }),
    });

    const { order } = await checkout.json();
    const refundRes = await fetch(`${baseUrl}/orders/${order.id}/refund`, { method: 'POST' });
    assert.equal(refundRes.status, 200);
    const refundBody = await refundRes.json();
    assert.equal(refundBody.order.status, 'refunded');

    const duplicate = await fetch(`${baseUrl}/orders/${order.id}/refund`, { method: 'POST' });
    assert.equal(duplicate.status, 400);
  });
});

test('refund flow blocks after cutoff and uses VAT defaults', async () => {
  const config = { ...loadConfig(), vatDefaultRate: 0.1, vatDefaultMode: 'excluded' };
  const orders = [];
  const soon = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const catalog = [
    {
      id: 'soon-event',
      supplierId: 'astra-marin',
      title: 'Событие скоро',
      type: 'event',
      departurePort: 'Порт',
      departureTime: soon,
      durationMinutes: 60,
      language: ['ru'],
      currency: 'RUB',
      fares: [{ code: 'base', name: 'Базовый', price: 1000 }],
    },
  ];

  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'), { orderStore: orders, catalogData: catalog });

  await withServer(handler, async (baseUrl) => {
    const checkout = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogItemId: 'soon-event',
        fareCode: 'base',
        quantity: 2,
        customer: { name: 'Late User', email: 'late@example.com', phone: '+79998887766' },
      }),
    });

    const { order } = await checkout.json();
    assert.equal(order.totals.vatRate, 0.1);
    assert.equal(order.totals.vatMode, 'excluded');
    assert.equal(order.totals.net, 2000);
    assert.equal(order.totals.vatAmount, 200);
    assert.equal(order.totals.gross, 2200);

    const refundRes = await fetch(`${baseUrl}/orders/${order.id}/refund`, { method: 'POST' });
    assert.equal(refundRes.status, 400);
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

test('checkout creates an order with totals and refund policy', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogItemId: 'exc-001',
        fareCode: 'adult',
        quantity: 2,
        customer: { name: 'Test User', email: 'user@example.com', phone: '+79998887766' },
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    const order = body.order;
    assert.ok(order.id);
    assert.equal(order.totals.gross, 5000);
    assert.equal(order.totals.vatRate, 0.2);
    assert.equal(order.totals.vatMode, 'included');
    assert.equal(order.totals.net, 4166.67);
    assert.equal(order.totals.vatAmount, 833.33);
    assert.equal(order.refundPolicy.refundable, true);
    assert.ok(order.refundPolicy.refundableUntil);

    const detailRes = await fetch(`${baseUrl}/orders/${order.id}`);
    assert.equal(detailRes.status, 200);
    const detailBody = await detailRes.json();
    assert.equal(detailBody.order.id, order.id);
    assert.equal(detailBody.order.status, 'confirmed');
  });
});

test('checkout validates fare and quantity', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const badFare = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogItemId: 'exc-001',
        fareCode: 'missing',
        customer: { name: 'Test', email: 't@example.com', phone: '+79998887766' },
      }),
    });
    assert.equal(badFare.status, 400);

    const badQty = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogItemId: 'exc-001',
        fareCode: 'adult',
        quantity: 0,
        customer: { name: 'Test', email: 't@example.com', phone: '+79998887766' },
      }),
    });
    assert.equal(badQty.status, 400);
  });
});
