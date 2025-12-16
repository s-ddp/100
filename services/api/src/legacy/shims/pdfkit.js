export default class PDFDocument {
  constructor(_options = {}) {
    this.handlers = {};
  }
  pipe(stream) {
    this.stream = stream;
    return this;
  }
  fontSize(_size) {
    return this;
  }
  text(_text, _options = {}) {
    return this;
  }
  moveDown() {
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
