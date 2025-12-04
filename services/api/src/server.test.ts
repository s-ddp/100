import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import { createApp } from "./app";
import { loadConfig } from "./config/env";
import { resetWaterState } from "./core/waterStore";

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

test("water event detail exposes seat map and trips", async () => {
  resetWaterState();
  await withServer(async (baseUrl) => {
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

test("seat booking enforces session ownership", async () => {
  resetWaterState();
  await withServer(async (baseUrl) => {
    const hold = await fetch(`${baseUrl}/events/event_moscow_river/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionID: "s1", seatID: "1A", tripId: "trip_moscow_evening" }),
    });
    assert.equal(hold.status, 201);

    const conflict = await fetch(`${baseUrl}/events/event_moscow_river/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionID: "s2", seatID: "1A", tripId: "trip_moscow_evening" }),
    });
    assert.equal(conflict.status, 409);

    const wrongUnbook = await fetch(`${baseUrl}/events/event_moscow_river/unbook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionID: "other", seatID: "1A", tripId: "trip_moscow_evening" }),
    });
    assert.equal(wrongUnbook.status, 403);

    const release = await fetch(`${baseUrl}/events/event_moscow_river/unbook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionID: "s1", seatID: "1A", tripId: "trip_moscow_evening" }),
    });
    assert.equal(release.status, 200);
  });
});

test("seat orders mark seats as sold and allow confirmation", async () => {
  resetWaterState();
  await withServer(async (baseUrl) => {
    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "event_moscow_river",
        tripId: "trip_moscow_evening",
        seats: ["1B", "2A"],
        ticketTypeId: "adult",
        customer: { name: "Seat Buyer", phone: "+79991112233" },
      }),
    });

    assert.equal(orderRes.status, 201);
    const { order } = await orderRes.json();
    assert.equal(order.status, "pending_payment");

    const seatMapRes = await fetch(`${baseUrl}/trips/trip_moscow_evening/seatmap`);
    const seatMapBody = await seatMapRes.json();
    const soldSeats = seatMapBody.seatMap.areas.flatMap((area: any) => area.seats.filter((seat: any) => seat.status === "sold"));
    assert.ok(soldSeats.some((seat: any) => seat.id === "1B"));

    const confirm = await fetch(`${baseUrl}/orders/${order.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "mock", reference: "test-payment" }),
    });
    assert.equal(confirm.status, 200);
    const confirmBody = await confirm.json();
    assert.equal(confirmBody.order.status, "confirmed");
  });
});
