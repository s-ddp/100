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

      return sendJson(res, 404, { ...basePayload, error: 'Not Found' });
    } catch (err) {
      logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Unhandled server error');
      return sendJson(res, 500, { ...basePayload, error: 'Internal server error' });
    }
  };
}
