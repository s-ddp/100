export default class PDFDocument {
  constructor() {
    this.handlers = {};
  }
  pipe(stream) {
    this.stream = stream;
  }
  fontSize() {
    return this;
  }
  text() {
    return this;
  }
  end() {
    if (this.handlers.finish) {
      this.handlers.finish.forEach((cb) => cb());
    }
  }
  on(event, handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }
}
