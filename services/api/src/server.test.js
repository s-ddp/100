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
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await fn(baseUrl);
  } finally {
    server.close();
  }
}

test('status endpoint responds with ok', async () => {
  const handler = createRequestHandler(loadConfig(), createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/status`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'ticketing-api');
  });
});

test('events list returns excursions with schedule metadata', async () => {
  const handler = createRequestHandler(loadConfig(), createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/events`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.events));
    assert.ok(body.events.length >= 1);
    const first = body.events[0];
    assert.ok(first.id);
    assert.ok(first.title);
    assert.ok(first.date);
  });
});

test('seat layout and booking lifecycle are available for events', async () => {
  const handler = createRequestHandler(loadConfig(), createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const eventsRes = await fetch(`${baseUrl}/events`);
    const { events } = await eventsRes.json();
    const targetEvent = events[0];

    const detailRes = await fetch(`${baseUrl}/events/${targetEvent.id}`);
    assert.equal(detailRes.status, 200);
    const detail = await detailRes.json();
    assert.ok(detail.event.seatMap);
    assert.ok(Array.isArray(detail.event.trips));

    const seatsRes = await fetch(`${baseUrl}/events/${targetEvent.id}/seats?tripId=${detail.event.trips[0]?.id || ''}`);
    assert.equal(seatsRes.status, 200);
    const seatsBody = await seatsRes.json();
    assert.ok(seatsBody.total >= 1);

    const hold = await fetch(`${baseUrl}/events/${targetEvent.id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionID: 'lock-session', seatID: '1A', tripId: detail.event.trips[0]?.id }),
    });
    assert.equal(hold.status, 201);

    const conflict = await fetch(`${baseUrl}/events/${targetEvent.id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionID: 'other', seatID: '1A', tripId: detail.event.trips[0]?.id }),
    });
    assert.equal(conflict.status, 409);

    const release = await fetch(`${baseUrl}/events/${targetEvent.id}/unbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionID: 'lock-session', seatID: '1A', tripId: detail.event.trips[0]?.id }),
    });
    assert.equal(release.status, 200);
  });
});

test('ticket types and prices resolve for an event', async () => {
  const handler = createRequestHandler(loadConfig(), createLoggerWithLevel('fatal'));
  await withServer(handler, async (baseUrl) => {
    const eventsRes = await fetch(`${baseUrl}/events`);
    const { events } = await eventsRes.json();
    const targetEvent = events[0];

    const typesRes = await fetch(`${baseUrl}/events/${targetEvent.id}/ticket-types`);
    assert.equal(typesRes.status, 200);
    const typesBody = await typesRes.json();
    assert.ok(Array.isArray(typesBody.ticketTypes));
    assert.ok(typesBody.total >= 1);

    const firstType = typesBody.ticketTypes[0];
    const pricesRes = await fetch(
      `${baseUrl}/events/${targetEvent.id}/prices?ticketTypeId=${encodeURIComponent(firstType.ticketTypeID)}`,
    );
    assert.equal(pricesRes.status, 200);
    const pricesBody = await pricesRes.json();
    assert.ok(Array.isArray(pricesBody.prices));
    assert.ok(pricesBody.total >= 1);
  });
});

test('seat orders mark seats as sold and allow confirmation', async () => {
  const handler = createRequestHandler(loadConfig(), createLoggerWithLevel('fatal'));
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
