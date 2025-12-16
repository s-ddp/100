import http from 'node:http';
import { loadConfig } from './config.js';
import { createLoggerWithLevel } from './logger.js';
import { createRequestHandler } from './router.js';

function bootstrap() {
  const config = loadConfig();
  const logger = createLoggerWithLevel(config.logLevel);
  const handler = createRequestHandler(config, logger);

  const server = http.createServer(handler);

  server.listen(config.port, config.host, () => {
    logger.info({ port: config.port, host: config.host, env: config.env }, 'API server is running');
  });

  server.on('error', (err) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Failed to start API server');
    process.exit(1);
  });
}

bootstrap();
