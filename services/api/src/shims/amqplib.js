export default {
  async connect() {
    return {
      async createChannel() {
        return {
          async assertQueue() {},
          async sendToQueue() {},
          async consume(_queue, onMessage) {
            if (onMessage) onMessage({ content: Buffer.from('') });
          },
          async ack() {},
        };
      },
      async close() {},
    };
  },
};
