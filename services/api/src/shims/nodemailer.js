export function createTransport() {
  return {
    async sendMail() {
      return { messageId: `stub-${Date.now()}` };
    },
  };
}
export default { createTransport };
