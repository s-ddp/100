export default {
  async connect(_url) {
    return {
      async createChannel() {
        return {
          async assertQueue(_queue, _options = {}) {},
          async sendToQueue(_queue, _content, _options = {}) {},
          async consume(_queue, onMessage, _options = {}) {
            if (onMessage) onMessage({ content: Buffer.from("") });
          },
          async ack(_message) {},
        };
      },
      async close() {},
    };
  },
};
