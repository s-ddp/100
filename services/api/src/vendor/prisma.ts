export class PrismaClient {
  event = { findUnique: async (_args?: any) => null };
  seatLock = { create: async (_args?: any) => ({}), deleteMany: async (_args?: any) => ({}) };
  order = {
    create: async (args?: any) => ({ id: Date.now(), ...(args?.data ?? {}) }),
    findUnique: async (_args?: any) => null,
    update: async (_args?: any) => ({}),
  };
  orderItem = { create: async (_args?: any) => ({}) };
  async $disconnect() {
    return;
  }
}
