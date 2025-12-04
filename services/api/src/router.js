import crypto from 'node:crypto';
import { sampleCatalog, sampleSuppliers } from './sample-data.js';

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
  const orders = options.orderStore || [];
  const defaultVatRate = typeof config.vatDefaultRate === 'number' ? config.vatDefaultRate : 0;
  const defaultVatMode = config.vatDefaultMode || 'included';

  return async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const path = url.pathname;

      if (req.method === 'GET' && path === '/health') {
        return sendJson(res, 200, { ...basePayload, status: 'ok', uptimeMs: Math.round(process.uptime() * 1000) });
      }

      if (req.method === 'GET' && path === '/readiness') {
        return sendJson(res, 200, { ...basePayload, status: 'ready', timestamp: new Date().toISOString() });
      }

      if (req.method === 'GET' && path === '/catalog') {
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

      if (req.method === 'GET' && path === '/suppliers') {
        return sendJson(res, 200, { ...basePayload, suppliers, total: suppliers.length });
      }

      if (req.method === 'POST' && path === '/echo') {
        const body = await readBody(req);
        return sendJson(res, 200, { ...basePayload, echo: parseJson(body) });
      }

      if (req.method === 'POST' && path === '/checkout') {
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
          createdAt: new Date().toISOString(),
          catalogItemId: item.id,
          fareCode,
          quantity: qty,
          totals: { currency: item.currency || 'RUB', ...totals },
          customer,
          seating,
          refundPolicy: {
            refundable,
            refundableUntil: refundableUntil ? refundableUntil.toISOString() : null,
          },
        };

        orders.push(order);

        return sendJson(res, 201, { ...basePayload, order });
      }

      const orderMatch = matchPath(path, '/orders');
      if (req.method === 'GET' && orderMatch) {
        const id = orderMatch;
        const order = orders.find((entry) => entry.id === id);
        if (!order) {
          return sendJson(res, 404, { ...basePayload, error: 'Order not found', id });
        }
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
        order.refundedAt = new Date().toISOString();
        order.refundSummary = { amount: order.totals?.gross || 0, currency: order.totals?.currency || 'RUB' };

        return sendJson(res, 200, { ...basePayload, order });
      }

      return sendJson(res, 404, { ...basePayload, error: 'Not Found' });
    } catch (err) {
      logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Unhandled server error');
      return sendJson(res, 500, { ...basePayload, error: 'Internal server error' });
    }
  };
}
