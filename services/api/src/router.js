import crypto from 'node:crypto';
import { sampleCatalog, sampleSuppliers } from './sample-data.js';
import {
  waterEvents,
  waterSeatMaps,
  waterSeatPrices,
  waterTicketTypes,
  waterTrips,
  waterVessels,
} from './water-data.js';

function nowIso() {
  return new Date().toISOString();
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('utf8'));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function parseJson(body) {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch (err) {
    return body;
  }
}

function parseVat(vat, fallback) {
  if (!vat) return fallback;
  if (typeof vat === 'number') return vat;
  const match = /^([0-9]+(?:\.[0-9]+)?)%$/.exec(vat.trim());
  if (!match) return fallback;
  return Number(match[1]) / 100;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function calculateTotals(price, qty, vatRate, vatMode) {
  const mode = vatMode === 'excluded' || vatMode === 'none' || vatMode === 'included' ? vatMode : 'included';
  const effectiveVat = mode === 'none' ? 0 : vatRate;

  if (mode === 'included') {
    const gross = roundMoney(price * qty);
    const net = roundMoney(gross / (1 + effectiveVat));
    const vatAmount = roundMoney(gross - net);
    return { net, vatAmount, gross, vatRate: effectiveVat, vatMode: mode };
  }

  // excluded
  const net = roundMoney(price * qty);
  const vatAmount = roundMoney(net * effectiveVat);
  const gross = roundMoney(net + vatAmount);
  return { net, vatAmount, gross, vatRate: effectiveVat, vatMode: mode };
}

function matchPath(pathname, prefix) {
  if (!pathname.startsWith(prefix)) return null;
  const remainder = pathname.slice(prefix.length);
  if (remainder.startsWith('/')) return remainder.slice(1);
  return remainder.length === 0 ? '' : remainder;
}

function filterCatalog(items, url) {
  const type = url.searchParams.get('type');
  const supplier = url.searchParams.get('supplier');
  const locale = url.searchParams.get('lang');

  return items.filter((item) => {
    const matchesType = type ? item.type === type : true;
    const matchesSupplier = supplier ? item.supplierId === supplier : true;
    const matchesLocale = locale ? item.language?.includes(locale) : true;
    return matchesType && matchesSupplier && matchesLocale;
  });
}

export function createRequestHandler(config, logger, options = {}) {
  const basePayload = { service: config.serviceName, env: config.env };
  const catalog = options.catalogData || sampleCatalog;
  const suppliers = options.supplierData || sampleSuppliers;
  const events = options.waterEventsData || waterEvents;
  const trips = options.waterTripsData || waterTrips;
  const seatMaps = options.waterSeatMaps || waterSeatMaps;
  const vessels = options.waterVessels || waterVessels;
  const seatPrices = options.waterSeatPrices || waterSeatPrices;
  const ticketTypes = options.waterTicketTypes || waterTicketTypes;
  const orders = options.orderStore || [];
  const supportCases = options.supportCaseStore || [];
  const seatReservations = options.seatReservations || new Map();
  const defaultVatRate = typeof config.vatDefaultRate === 'number' ? config.vatDefaultRate : 0;
  const defaultVatMode = config.vatDefaultMode || 'included';
  const metrics = {
    requests: 0,
    health: 0,
    readiness: 0,
    catalog: 0,
    checkout: 0,
    refund: 0,
    documents: 0,
    crmOrders: 0,
    crmCases: 0,
  };

  const crmSlo = config.crmSlo || { p95Ms: 800, p99Ms: 1500 };
  const supportSla = config.supportSla || { firstResponseMinutes: 15, resolutionMinutes: 240 };

  function buildDocuments(order) {
    const vatRate = typeof order.totals?.vatRate === 'number' ? order.totals.vatRate : defaultVatRate;
    const vatMode = order.totals?.vatMode || defaultVatMode;
    const amount = order.totals?.gross ?? 0;
    const net = vatMode === 'included' ? roundMoney(amount / (1 + vatRate)) : order.totals?.net ?? amount;
    const vatAmount = vatMode === 'included' ? roundMoney(amount - net) : roundMoney(net * vatRate);

    const baseDoc = {
      orderId: order.id,
      customer: order.customer,
      currency: order.totals?.currency || 'RUB',
      totals: {
        net,
        vatAmount,
        vatRate,
        vatMode,
        gross: amount,
      },
      issuedAt: nowIso(),
    };

    return {
      invoice: { ...baseDoc, type: 'invoice', number: `INV-${order.id.slice(0, 8)}` },
      act: { ...baseDoc, type: 'act', number: `ACT-${order.id.slice(0, 8)}` },
    };
  }

  function buildSlaDeadlines(priority = 'standard') {
    const multiplier = priority === 'high' ? 0.5 : priority === 'low' ? 1.5 : 1;
    const now = Date.now();
    const firstResponseMs = (supportSla.firstResponseMinutes || 15) * 60 * 1000 * multiplier;
    const resolutionMs = (supportSla.resolutionMinutes || 240) * 60 * 1000 * multiplier;
    return {
      targetFirstResponseMinutes: supportSla.firstResponseMinutes,
      targetResolutionMinutes: supportSla.resolutionMinutes,
      firstResponseDueAt: new Date(now + firstResponseMs).toISOString(),
      resolutionDueAt: new Date(now + resolutionMs).toISOString(),
    };
  }

  function findEvent(eventId) {
    return events.find((entry) => entry.id === eventId);
  }

  function findTrip(tripId) {
    return trips.find((entry) => entry.id === tripId);
  }

  function findSeatMapForEvent(event) {
    if (!event?.seatMapId) return null;
    return seatMaps.find((map) => map.id === event.seatMapId) || null;
  }

  function getSeatCategoryForSeat(seatMap, seatId) {
    if (!seatMap) return null;
    for (const area of seatMap.areas) {
      if (area.seats.some((seat) => seat.id === seatId)) {
        return area;
      }
    }
    return null;
  }

  function reservationKey(eventId, tripId, seatId) {
    return `${eventId}:${tripId || 'na'}:${seatId}`;
  }

  function cleanupExpiredReservations() {
    const now = Date.now();
    for (const [key, reservation] of seatReservations.entries()) {
      if (reservation.status !== 'reserved') continue;

      const expiresAt = reservation.holdExpiresAt ? new Date(reservation.holdExpiresAt).getTime() : null;
      if (expiresAt && expiresAt <= now) {
        seatReservations.delete(key);
      }
    }
  }

  function buildSeatStatus(seatMap, eventId, tripId) {
    if (!seatMap) return null;
    return {
      ...seatMap,
      areas: seatMap.areas.map((area) => ({
        ...area,
        seats: area.seats.map((seat) => {
          const key = reservationKey(eventId, tripId, seat.id);
          const reservation = seatReservations.get(key);
          const status = reservation?.status === 'sold' ? 'sold' : reservation?.status === 'reserved' ? 'reserved' : seat.status;
          return {
            ...seat,
            status,
            reservation: reservation
              ? {
                  sessionID: reservation.sessionID,
                  status: reservation.status,
                  holdExpiresAt: reservation.holdExpiresAt,
                  orderId: reservation.orderId,
                }
              : undefined,
          };
        }),
      })),
    };
  }

  function findPrice(eventId, seatCategoryId, ticketTypeId) {
    return seatPrices.find(
      (price) => price.eventId === eventId && price.seatCategoryId === seatCategoryId && price.ticketTypeId === ticketTypeId,
    );
  }

  function nextTripForEvent(eventId) {
    const sorted = trips
      .filter((trip) => trip.eventId === eventId)
      .map((trip) => ({
        ...trip,
        departureDateTime: new Date(`${trip.date}T${trip.time}:00`).toISOString(),
      }))
      .sort((a, b) => new Date(a.departureDateTime).getTime() - new Date(b.departureDateTime).getTime());
    return sorted[0] || null;
  }

  return async (req, res) => {
    try {
      cleanupExpiredReservations();
      metrics.requests += 1;
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const path = url.pathname;

      if (req.method === 'GET' && path === '/status') {
        return sendJson(res, 200, { ...basePayload, status: 'ok', uptimeMs: Math.round(process.uptime() * 1000) });
      }

      if (req.method === 'GET' && path === '/health') {
        metrics.health += 1;
        return sendJson(res, 200, { ...basePayload, status: 'ok', uptimeMs: Math.round(process.uptime() * 1000) });
      }

      if (req.method === 'GET' && path === '/readiness') {
        metrics.readiness += 1;
        return sendJson(res, 200, { ...basePayload, status: 'ready', timestamp: new Date().toISOString() });
      }

      if (req.method === 'GET' && path === '/metrics') {
        const lines = [
          `service_requests_total ${metrics.requests}`,
          `service_health_total ${metrics.health}`,
          `service_readiness_total ${metrics.readiness}`,
          `service_catalog_total ${metrics.catalog}`,
          `service_checkout_total ${metrics.checkout}`,
          `service_refund_total ${metrics.refund}`,
          `service_documents_total ${metrics.documents}`,
          `service_crm_orders_total ${metrics.crmOrders}`,
          `service_crm_cases_total ${metrics.crmCases}`,
        ];
        res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
        res.end(lines.join('\n'));
        return;
      }

      if (req.method === 'GET' && path === '/catalog') {
        metrics.catalog += 1;
        const items = filterCatalog(catalog, url);
        return sendJson(res, 200, { ...basePayload, items, total: items.length });
      }

      const catalogMatch = matchPath(path, '/catalog');
      if (req.method === 'GET' && catalogMatch) {
        const id = catalogMatch;
        const item = catalog.find((entry) => entry.id === id);
        if (!item) {
          return sendJson(res, 404, { ...basePayload, error: 'Catalog item not found', id });
        }
        return sendJson(res, 200, { ...basePayload, item });
      }

      if (req.method === 'GET' && path === '/events') {
        const enriched = events.map((event) => {
          const nextTrip = nextTripForEvent(event.id);
          return {
            id: event.id,
            title: event.title,
            category: event.category,
            description: event.description,
            city: event.city,
            hasSeating: event.hasSeating,
            vesselType: event.vesselType,
            date: nextTrip?.departureDateTime,
            pierStart: nextTrip?.pierStart || event.pierStart,
            pierEnd: nextTrip?.pierEnd || event.pierEnd,
            durationMinutes: event.durationMinutes,
            image: event.image,
          };
        });

        return sendJson(res, 200, { ...basePayload, events: enriched, total: enriched.length });
      }

      const eventMatch = matchPath(path, '/events');
      if (eventMatch) {
        const [eventId, tail] = eventMatch.split('/')
          .filter(Boolean)
          .reduce(
            (acc, part, idx) => {
              if (idx === 0) acc[0] = part;
              else acc[1].push(part);
              return acc;
            },
            ['', []],
          );

        const event = findEvent(eventId);
        if (!event) {
          return sendJson(res, 404, { ...basePayload, error: 'Event not found', id: eventId });
        }

        const remainingPath = tail.join('/');

        if (!remainingPath && req.method === 'GET') {
          const vessel = vessels.find((item) => item.id === event.vesselId);
          const seatMap = buildSeatStatus(findSeatMapForEvent(event), event.id, undefined);
          return sendJson(res, 200, { ...basePayload, event: { ...event, vessel, seatMap, trips: trips.filter((trip) => trip.eventId === event.id) } });
        }

        if (req.method === 'GET' && remainingPath === 'trips') {
          const list = trips.filter((trip) => trip.eventId === event.id);
          return sendJson(res, 200, { ...basePayload, trips: list, total: list.length });
        }

        if (req.method === 'GET' && remainingPath === 'categories') {
          const seatMap = findSeatMapForEvent(event);
          const categories = seatMap?.areas.map((area) => ({
            id: area.id,
            name: area.name,
            priceFrom: area.price,
            seats: area.seats.length,
          })) || [];
          return sendJson(res, 200, { ...basePayload, categories, total: categories.length });
        }

        if (req.method === 'GET' && remainingPath === 'seats') {
          const seatMap = buildSeatStatus(findSeatMapForEvent(event), event.id, url.searchParams.get('tripId') || undefined);
          const seats = seatMap
            ? seatMap.areas.flatMap((area) => area.seats.map((seat) => ({ ...seat, categoryId: area.id, categoryName: area.name })))
            : [];
          return sendJson(res, 200, { ...basePayload, seats, total: seats.length });
        }

        if (req.method === 'GET' && remainingPath === 'ticket-types') {
          return sendJson(res, 200, { ...basePayload, ticketTypes, total: ticketTypes.length });
        }

        if (req.method === 'GET' && remainingPath === 'prices') {
          const prices = seatPrices.filter((price) => price.eventId === event.id);
          return sendJson(res, 200, { ...basePayload, prices, total: prices.length });
        }

        if (req.method === 'POST' && remainingPath === 'book') {
          const payload = parseJson(await readBody(req));
          if (!payload || typeof payload !== 'object') {
            return sendJson(res, 400, { ...basePayload, error: 'Invalid payload' });
          }

          const { sessionID, seatID, tripId } = payload;
          if (!sessionID || !seatID) {
            return sendJson(res, 400, { ...basePayload, error: 'sessionID and seatID are required' });
          }

          const trip = tripId ? findTrip(tripId) : null;
          if (tripId && !trip) {
            return sendJson(res, 404, { ...basePayload, error: 'Trip not found', tripId });
          }

          const seatMap = findSeatMapForEvent(event);
          const category = getSeatCategoryForSeat(seatMap, seatID);
          if (!category) {
            return sendJson(res, 404, { ...basePayload, error: 'Seat not found in event seat map', seatID });
          }

          const key = reservationKey(event.id, tripId || trip?.id, seatID);
          const existing = seatReservations.get(key);
          if (existing && existing.sessionID !== sessionID && existing.status !== 'sold') {
            return sendJson(res, 409, { ...basePayload, error: 'Seat already reserved', seatID });
          }

          const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          const reservation = { sessionID, seatID, eventId: event.id, tripId: tripId || trip?.id, status: 'reserved', holdExpiresAt };
          seatReservations.set(key, reservation);

          return sendJson(res, 201, { ...basePayload, reservation });
        }

        if (req.method === 'POST' && remainingPath === 'unbook') {
          const payload = parseJson(await readBody(req));
          if (!payload || typeof payload !== 'object') {
            return sendJson(res, 400, { ...basePayload, error: 'Invalid payload' });
          }

          const { sessionID, seatID, tripId } = payload;
          if (!sessionID || !seatID) {
            return sendJson(res, 400, { ...basePayload, error: 'sessionID and seatID are required' });
          }

          const key = reservationKey(event.id, tripId, seatID);
          const existing = seatReservations.get(key);
          if (!existing) {
            return sendJson(res, 404, { ...basePayload, error: 'Reservation not found', seatID });
          }
          if (existing.sessionID !== sessionID) {
            return sendJson(res, 403, { ...basePayload, error: 'Reservation belongs to another session', seatID });
          }

          seatReservations.delete(key);
          return sendJson(res, 200, { ...basePayload, released: seatID });
        }
      }

      const tripMatch = matchPath(path, '/trips');
      if (req.method === 'GET' && tripMatch && tripMatch.endsWith('/seatmap')) {
        const tripId = tripMatch.replace(/\/$/, '').replace(/\/seatmap$/, '');
        const trip = findTrip(tripId);
        if (!trip) {
          return sendJson(res, 404, { ...basePayload, error: 'Trip not found', tripId });
        }
        const event = findEvent(trip.eventId);
        const seatMap = buildSeatStatus(findSeatMapForEvent(event), event?.id, trip.id);
        if (!seatMap) {
          return sendJson(res, 404, { ...basePayload, error: 'Seat map not available for trip', tripId });
        }
        return sendJson(res, 200, { ...basePayload, seatMap });
      }

      if (req.method === 'GET' && path === '/suppliers') {
        return sendJson(res, 200, { ...basePayload, suppliers, total: suppliers.length });
      }

      if (req.method === 'GET' && path === '/crm/orders') {
        metrics.crmOrders += 1;
        return sendJson(res, 200, {
          ...basePayload,
          slo: crmSlo,
          orders: orders.map((order) => ({
            id: order.id,
            status: order.status,
            createdAt: order.createdAt,
            catalogItemId: order.catalogItemId,
            fareCode: order.fareCode,
            quantity: order.quantity,
            totals: order.totals,
            refundPolicy: order.refundPolicy,
          })),
          total: orders.length,
        });
      }

      if (req.method === 'GET' && path === '/crm/sla') {
        metrics.crmOrders += 1;
        return sendJson(res, 200, {
          ...basePayload,
          crmSlo,
          supportSla,
        });
      }

      if (req.method === 'POST' && path === '/echo') {
        const body = await readBody(req);
        return sendJson(res, 200, { ...basePayload, echo: parseJson(body) });
      }

      if (req.method === 'POST' && path === '/checkout') {
        metrics.checkout += 1;
        const payload = parseJson(await readBody(req));
        if (!payload || typeof payload !== 'object') {
          return sendJson(res, 400, { ...basePayload, error: 'Invalid payload' });
        }

        const { catalogItemId, fareCode, quantity = 1, customer, seating } = payload;
        if (!catalogItemId || !fareCode || !customer?.name || !customer?.email || !customer?.phone) {
          return sendJson(res, 400, { ...basePayload, error: 'Missing required fields' });
        }

        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
          return sendJson(res, 400, { ...basePayload, error: 'Quantity must be a positive integer' });
        }

        const item = catalog.find((entry) => entry.id === catalogItemId);
        if (!item) {
          return sendJson(res, 404, { ...basePayload, error: 'Catalog item not found', id: catalogItemId });
        }

        const fare = item.fares?.find((f) => f.code === fareCode);
        if (!fare) {
          return sendJson(res, 400, { ...basePayload, error: 'Fare not found', fareCode });
        }

        const vatRate = parseVat(fare.vat, defaultVatRate);
        const totals = calculateTotals(fare.price, qty, vatRate, fare.vatMode || defaultVatMode);

        const departureTime = item.departureTime ? new Date(item.departureTime).getTime() : null;
        const refundableUntil = departureTime ? new Date(departureTime - 24 * 60 * 60 * 1000) : null;
        const refundable = refundableUntil ? Date.now() < refundableUntil.getTime() : true;

        const order = {
          id: crypto.randomUUID(),
          status: 'confirmed',
          createdAt: nowIso(),
          catalogItemId: item.id,
          fareCode,
          quantity: qty,
          totals: { currency: item.currency || 'RUB', ...totals },
          customer,
          seating,
          documents: buildDocuments({
            id: 'pending',
            customer,
            totals: { currency: item.currency || 'RUB', ...totals },
          }),
          refundPolicy: {
            refundable,
            refundableUntil: refundableUntil ? refundableUntil.toISOString() : null,
          },
        };

        order.documents = buildDocuments(order);

        orders.push(order);

        return sendJson(res, 201, { ...basePayload, order });
      }

      if (req.method === 'POST' && path === '/orders') {
        const payload = parseJson(await readBody(req));
        if (!payload || typeof payload !== 'object') {
          return sendJson(res, 400, { ...basePayload, error: 'Invalid payload' });
        }

        const { eventId, tripId, seats = [], ticketTypeId = 'adult', sessionID, customer } = payload;
        const event = findEvent(eventId);
        if (!event) {
          return sendJson(res, 404, { ...basePayload, error: 'Event not found', eventId });
        }
        const trip = tripId ? findTrip(tripId) : null;
        if (tripId && !trip) {
          return sendJson(res, 404, { ...basePayload, error: 'Trip not found', tripId });
        }
        if (!customer?.name || !customer?.phone) {
          return sendJson(res, 400, { ...basePayload, error: 'Customer name and phone are required' });
        }
        if (!Array.isArray(seats) || seats.length === 0) {
          return sendJson(res, 400, { ...basePayload, error: 'At least one seat is required' });
        }

        const seatMap = findSeatMapForEvent(event);
        if (!seatMap && event.hasSeating) {
          return sendJson(res, 400, { ...basePayload, error: 'Seat map not configured for event', eventId });
        }

        let total = 0;
        const reservationSummary = [];

        for (const seatId of seats) {
          const category = getSeatCategoryForSeat(seatMap, seatId);
          if (!category) {
            return sendJson(res, 404, { ...basePayload, error: 'Seat not found', seatId });
          }

          const priceInfo = findPrice(event.id, category.id, ticketTypeId);
          if (!priceInfo) {
            return sendJson(res, 404, { ...basePayload, error: 'Price not found for seat', seatId, ticketTypeId });
          }

          const key = reservationKey(event.id, tripId || trip?.id, seatId);
          const existing = seatReservations.get(key);
          if (existing && existing.status === 'sold') {
            return sendJson(res, 409, { ...basePayload, error: 'Seat already sold', seatId });
          }
          if (existing && existing.sessionID !== sessionID && existing.status === 'reserved') {
            return sendJson(res, 409, { ...basePayload, error: 'Seat reserved by another session', seatId });
          }

          total += priceInfo.price;
          reservationSummary.push({ seatId, categoryId: category.id, price: priceInfo.price, currency: priceInfo.currency });
        }

        const order = {
          id: crypto.randomUUID(),
          type: 'seat-order',
          status: 'pending_payment',
          createdAt: nowIso(),
          eventId: event.id,
          tripId: trip?.id,
          seats,
          ticketTypeId,
          totals: { gross: total, currency: 'RUB', vatRate: defaultVatRate, vatMode: defaultVatMode },
          customer,
        };

        reservationSummary.forEach((seat) => {
          const key = reservationKey(event.id, tripId || trip?.id, seat.seatId);
          seatReservations.set(key, {
            sessionID: sessionID || 'order',
            seatID: seat.seatId,
            eventId: event.id,
            tripId: trip?.id,
            status: 'sold',
            orderId: order.id,
          });
        });

        orders.push(order);
        return sendJson(res, 201, { ...basePayload, order });
      }

      const orderMatch = matchPath(path, '/orders');
      if (req.method === 'GET' && orderMatch && path.endsWith('/documents')) {
        metrics.documents += 1;
        const id = orderMatch.replace(/\/$/, '').replace(/\/documents$/, '');
        const order = orders.find((entry) => entry.id === id);
        if (!order) {
          return sendJson(res, 404, { ...basePayload, error: 'Order not found', id });
        }

        const docs = order.documents || buildDocuments(order);
        return sendJson(res, 200, { ...basePayload, documents: docs });
      }

      if (req.method === 'GET' && orderMatch) {
        const id = orderMatch;
        const order = orders.find((entry) => entry.id === id);
        if (!order) {
          return sendJson(res, 404, { ...basePayload, error: 'Order not found', id });
        }
        return sendJson(res, 200, { ...basePayload, order });
      }

      if (req.method === 'POST' && orderMatch && !path.endsWith('/refund')) {
        const id = orderMatch;
        const order = orders.find((entry) => entry.id === id);
        if (!order) {
          return sendJson(res, 404, { ...basePayload, error: 'Order not found', id });
        }

        const payload = parseJson(await readBody(req));
        if (!payload || typeof payload !== 'object') {
          return sendJson(res, 400, { ...basePayload, error: 'Invalid payload' });
        }

        if (order.status === 'confirmed' || order.status === 'paid') {
          return sendJson(res, 200, { ...basePayload, order });
        }

        order.status = 'confirmed';
        order.payment = {
          provider: payload.provider || 'mock',
          reference: payload.reference || `payment-${order.id}`,
          confirmedAt: nowIso(),
        };

        return sendJson(res, 200, { ...basePayload, order });
      }

      if (req.method === 'POST' && orderMatch && path.endsWith('/refund')) {
        const id = orderMatch.replace(/\/$/, '').replace(/\/refund$/, '');
        const order = orders.find((entry) => entry.id === id);
        if (!order) {
          return sendJson(res, 404, { ...basePayload, error: 'Order not found', id });
        }

        if (order.status === 'refunded') {
          return sendJson(res, 400, { ...basePayload, error: 'Order already refunded', id });
        }

        const refundableUntil = order.refundPolicy?.refundableUntil
          ? new Date(order.refundPolicy.refundableUntil).getTime()
          : null;
        const refundable = refundableUntil ? Date.now() < refundableUntil : true;

        if (!refundable) {
          return sendJson(res, 400, { ...basePayload, error: 'Refund window closed', refundableUntil: order.refundPolicy?.refundableUntil });
        }

        order.status = 'refunded';
        order.refundedAt = nowIso();
        order.refundSummary = { amount: order.totals?.gross || 0, currency: order.totals?.currency || 'RUB' };
        metrics.refund += 1;

        return sendJson(res, 200, { ...basePayload, order });
      }

      if (req.method === 'GET' && path === '/crm/support/cases') {
        metrics.crmCases += 1;
        return sendJson(res, 200, { ...basePayload, cases: supportCases, total: supportCases.length, supportSla });
      }

      if (req.method === 'POST' && path === '/crm/support/cases') {
        metrics.crmCases += 1;
        const payload = parseJson(await readBody(req));
        if (!payload || typeof payload !== 'object') {
          return sendJson(res, 400, { ...basePayload, error: 'Invalid payload' });
        }

        const { subject, orderId, priority = 'standard', channel = 'email', customer } = payload;
        if (!subject || !customer?.name || !customer?.email) {
          return sendJson(res, 400, { ...basePayload, error: 'Missing required fields' });
        }

        const linkedOrder = orderId ? orders.find((entry) => entry.id === orderId) : null;
        const sla = buildSlaDeadlines(priority);
        const ticket = {
          id: `case-${crypto.randomUUID()}`,
          status: 'open',
          subject,
          priority,
          channel,
          orderId: linkedOrder?.id,
          customer,
          createdAt: nowIso(),
          sla,
        };

        supportCases.push(ticket);
        return sendJson(res, 201, { ...basePayload, case: ticket });
      }

      return sendJson(res, 404, { ...basePayload, error: 'Not Found' });
    } catch (err) {
      logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Unhandled server error');
      return sendJson(res, 500, { ...basePayload, error: 'Internal server error' });
    }
  };
}
