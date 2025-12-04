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

    const docsRes = await fetch(`${baseUrl}/orders/${order.id}/documents`);
    assert.equal(docsRes.status, 200);
    const docsBody = await docsRes.json();
    assert.ok(docsBody.documents?.invoice?.number);
    assert.ok(docsBody.documents?.act?.number);
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

test('metrics endpoint emits counters', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    await fetch(`${baseUrl}/health`);
    await fetch(`${baseUrl}/readiness`);
    await fetch(`${baseUrl}/catalog`);

    const metrics = await fetch(`${baseUrl}/metrics`);
    assert.equal(metrics.status, 200);
    const text = await metrics.text();
    assert.match(text, /service_requests_total/);
    assert.match(text, /service_catalog_total/);
  });
});

test('crm order listing exposes SLO targets', async () => {
  const config = loadConfig();
  const orders = [];
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'), { orderStore: orders });
  await withServer(handler, async (baseUrl) => {
    const checkout = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogItemId: 'exc-001',
        fareCode: 'adult',
        quantity: 1,
        customer: { name: 'CRM User', email: 'crm@example.com', phone: '+79998887766' },
      }),
    });
    assert.equal(checkout.status, 201);

    const list = await fetch(`${baseUrl}/crm/orders`);
    assert.equal(list.status, 200);
    const body = await list.json();
    assert.equal(body.total, 1);
    assert.equal(body.orders[0].status, 'confirmed');
    assert.ok(body.slo.p95Ms);
    assert.ok(body.slo.p99Ms);
  });
});

test('support cases include SLA deadlines', async () => {
  const config = loadConfig();
  const orders = [];
  const supportCases = [];
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'), { orderStore: orders, supportCaseStore: supportCases });
  await withServer(handler, async (baseUrl) => {
    const checkout = await fetch(`${baseUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogItemId: 'exc-001',
        fareCode: 'adult',
        quantity: 1,
        customer: { name: 'Support User', email: 'support@example.com', phone: '+79998887766' },
      }),
    });
    const { order } = await checkout.json();

    const created = await fetch(`${baseUrl}/crm/support/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Помощь с билетом',
        orderId: order.id,
        priority: 'high',
        channel: 'whatsapp',
        customer: { name: 'Support User', email: 'support@example.com' },
      }),
    });
    assert.equal(created.status, 201);
    const createdBody = await created.json();
    assert.ok(createdBody.case.sla.firstResponseDueAt);

    const list = await fetch(`${baseUrl}/crm/support/cases`);
    const listBody = await list.json();
    assert.equal(listBody.total, 1);
    assert.equal(listBody.cases[0].orderId, order.id);
    assert.equal(listBody.supportSla.firstResponseMinutes, config.supportSla.firstResponseMinutes);
  });
});

test('status endpoint and events list surface water domain metadata', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const status = await fetch(`${baseUrl}/status`);
    assert.equal(status.status, 200);
    const statusBody = await status.json();
    assert.equal(statusBody.status, 'ok');

    const eventsRes = await fetch(`${baseUrl}/events`);
    assert.equal(eventsRes.status, 200);
    const eventsBody = await eventsRes.json();
    assert.ok(eventsBody.total >= 1);
    const first = eventsBody.events?.[0];
    assert.ok(first?.city);
    assert.ok(first?.category);
  });
});

test('water event detail exposes seat map and trips', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/events/event_moscow_river`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.event.seatMap);
    assert.ok(Array.isArray(body.event.trips));

    const trips = await fetch(`${baseUrl}/events/event_moscow_river/trips`);
    const tripsBody = await trips.json();
    assert.ok(tripsBody.total >= 1);

    const categories = await fetch(`${baseUrl}/events/event_moscow_river/categories`);
    const categoriesBody = await categories.json();
    assert.ok(categoriesBody.total >= 1);
  });
});

test('seat booking enforces session ownership', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const hold = await fetch(`${baseUrl}/events/event_moscow_river/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionID: 's1', seatID: '1A', tripId: 'trip_moscow_evening' }),
    });
    assert.equal(hold.status, 201);

    const conflict = await fetch(`${baseUrl}/events/event_moscow_river/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionID: 's2', seatID: '1A', tripId: 'trip_moscow_evening' }),
    });
    assert.equal(conflict.status, 409);

    const wrongUnbook = await fetch(`${baseUrl}/events/event_moscow_river/unbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionID: 'other', seatID: '1A', tripId: 'trip_moscow_evening' }),
    });
    assert.equal(wrongUnbook.status, 403);

    const release = await fetch(`${baseUrl}/events/event_moscow_river/unbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionID: 's1', seatID: '1A', tripId: 'trip_moscow_evening' }),
    });
    assert.equal(release.status, 200);
  });
});

test('seat orders mark seats as sold and allow confirmation', async () => {
  const config = loadConfig();
  const handler = createRequestHandler(config, createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'event_moscow_river',
        tripId: 'trip_moscow_evening',
        seats: ['1B', '2A'],
        ticketTypeId: 'adult',
        customer: { name: 'Seat Buyer', phone: '+79991112233' },
      }),
    });

    assert.equal(orderRes.status, 201);
    const { order } = await orderRes.json();
    assert.equal(order.status, 'pending_payment');

    const seatMapRes = await fetch(`${baseUrl}/trips/trip_moscow_evening/seatmap`);
    const seatMapBody = await seatMapRes.json();
    const soldSeats = seatMapBody.seatMap.areas.flatMap((area) => area.seats.filter((seat) => seat.status === 'sold'));
    assert.ok(soldSeats.some((seat) => seat.id === '1B'));

    const confirm = await fetch(`${baseUrl}/orders/${order.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'mock', reference: 'test-payment' }),
    });
    assert.equal(confirm.status, 200);
    const confirmBody = await confirm.json();
    assert.equal(confirmBody.order.status, 'confirmed');
  });
});
