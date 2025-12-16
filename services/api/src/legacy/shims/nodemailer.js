export function createTransport(_options = {}) {
  return {
    async sendMail(_mailOptions = {}) {
      return { messageId: `stub-${Date.now()}` };
    },
  };
}
export default { createTransport };
