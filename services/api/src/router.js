function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
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

export function createRequestHandler(config, logger) {
  const basePayload = { service: config.serviceName, env: config.env };

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

      if (req.method === 'POST' && path === '/echo') {
        const body = await readBody(req);
        return sendJson(res, 200, { ...basePayload, echo: body || null });
      }

      return sendJson(res, 404, { ...basePayload, error: 'Not Found' });
    } catch (err) {
      logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Unhandled server error');
      return sendJson(res, 500, { ...basePayload, error: 'Internal server error' });
    }
  };
}
