import { createServer } from 'node:http';
import { createReadStream, statSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const publicDir = join(__dirname, 'public');
const port = Number(process.env.PORT) || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function resolvePath(urlPath) {
  const safePath = urlPath.split('?')[0].replace(/\.\.+/g, '');
  const target = safePath === '/' ? '/index.html' : safePath;
  return join(publicDir, target);
}

function serveFile(res, filePath) {
  const ext = extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');

  if (existsSync(filePath)) {
    serveFile(res, filePath);
    return;
  }

  // basic 404 fallback
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, () => {
  console.log(`Static site available at http://localhost:${port}`);
});
