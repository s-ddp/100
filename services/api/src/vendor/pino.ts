export default function pino(_options?: any) {
  const fn: any = (...args: any[]) => console.log(...args);
  fn.info = (...args: any[]) => console.log(...args);
  fn.error = (...args: any[]) => console.error(...args);
  fn.warn = (...args: any[]) => console.warn(...args);
  return fn;
}
