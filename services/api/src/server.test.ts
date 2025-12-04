import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";

async function withServer(fn: (baseUrl: string) => Promise<void>) {
  const app = createApp(loadConfig());
  const server = app.listen ? app.listen(0, "127.0.0.1") : http.createServer(app).listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => {
    if ((server as any).listening) return resolve();
    (server as any).once("listening", resolve);
  });
  const { port } = server.address() as any;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await fn(baseUrl);
  } finally {
    server.close();
  }
}

test("status endpoint responds with ok", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/status`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.service, "ticketing-api");
  });
});

test("events list returns stubbed excursions", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/events`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.events));
    assert.ok(body.events.length >= 1);
    const first = body.events[0];
    assert.ok(first.id);
    assert.ok(first.datetime);
  });
});

test("seat layout and locking work via fixtures", async () => {
  await withServer(async (baseUrl) => {
    const eventsRes = await fetch(`${baseUrl}/events`);
    const { events } = await eventsRes.json();
    const targetEvent = events[0];

    const layoutRes = await fetch(`${baseUrl}/events/${targetEvent.id}/seat-layout`);
    assert.equal(layoutRes.status, 200);
    const layout = await layoutRes.json();
    assert.equal(layout.eventId, targetEvent.id);
    assert.ok(layout.levels?.length >= 1);

    const lockRes = await fetch(`${baseUrl}/events/${targetEvent.id}/seats/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: "test-session", seats: ["M1"] }),
    });

    assert.equal(lockRes.status, 200);
    const locked = await lockRes.json();
    assert.ok(Array.isArray(locked.locked));
  });
});

test("ticket types and prices resolve for an event", async () => {
  await withServer(async (baseUrl) => {
    const eventsRes = await fetch(`${baseUrl}/events`);
    const { events } = await eventsRes.json();
    const targetEvent = events[0];

    const typesRes = await fetch(`${baseUrl}/events/${targetEvent.id}/ticket-types`);
    assert.equal(typesRes.status, 200);
    const { ticketTypes } = await typesRes.json();
    assert.ok(Array.isArray(ticketTypes));
    assert.ok(ticketTypes.length > 0);

    const firstType = ticketTypes[0];
    const pricesRes = await fetch(
      `${baseUrl}/events/${targetEvent.id}/prices?ticketTypeId=${encodeURIComponent(firstType.ticketTypeID)}`,
    );
    assert.equal(pricesRes.status, 200);
    const { prices } = await pricesRes.json();
    assert.ok(Array.isArray(prices));
  });
});
