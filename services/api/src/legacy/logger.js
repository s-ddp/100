const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

function createLogger(levelName = 'info') {
  const threshold = levels.indexOf(levelName);

  const log = (level, message, meta) => {
    const levelIndex = levels.indexOf(level);
    if (threshold === -1 || levelIndex === -1 || levelIndex < threshold) return;

    const payload = {
      level,
      time: new Date().toISOString(),
      message,
      ...meta,
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload));
  };

  return {
    info: (meta, message) => log('info', message, meta),
    warn: (meta, message) => log('warn', message, meta),
    error: (meta, message) => log('error', message, meta),
    debug: (meta, message) => log('debug', message, meta),
  };
}

export const logger = createLogger('info');
export function createLoggerWithLevel(levelName) {
  return createLogger(levelName);
}
