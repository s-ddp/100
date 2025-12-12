const seatMaps: any[] = [];
const seats: any[] = [];
const seatLocks: any[] = [];
const waterSeatLocks: any[] = [];

function ensureId(value?: any) {
  return value ?? `id-${Math.random().toString(16).slice(2)}`;
}

export class PrismaClient {
  event = { findUnique: async (_args?: any) => null };

  seatMap = {
    findUnique: async (args?: any) => {
      const where = args?.where ?? {};
      const found = seatMaps.find(
        (m) => (where.id && m.id === where.id) || (where.eventId && m.eventId === where.eventId),
      );
      if (!found) return null;
      if (args?.include?.seats) {
        return { ...found, seats: seats.filter((s) => s.seatMapId === found.id) };
      }
      return found;
    },
    create: async (args: any) => {
      const entry = { id: ensureId(args?.data?.id), ...args.data };
      seatMaps.push(entry);
      return entry;
    },
  };

  seat = {
    findMany: async (args?: any) => {
      if (!args?.where) return [...seats];
      return seats.filter((s) => {
        if (args.where.seatMapId && s.seatMapId !== args.where.seatMapId) return false;
        if (Array.isArray(args.where.id?.in) && !args.where.id.in.includes(s.id)) return false;
        return true;
      });
    },
    createMany: async (args: any) => {
      const data = Array.isArray(args?.data) ? args.data : [];
      data.forEach((entry) => seats.push({ id: ensureId(entry.id), ...entry }));
      return { count: data.length };
    },
  };

  seatLock = {
    findMany: async (args?: any) => {
      const where = args?.where ?? {};
      return seatLocks.filter((lock) => {
        if (where.eventId && lock.eventId !== where.eventId) return false;
        if (Array.isArray(where.seatId?.in) && !where.seatId.in.includes(lock.seatId)) return false;
        if (where.expiresAt?.gt && !(lock.expiresAt > where.expiresAt.gt)) return false;
        if (where.expiresAt?.lt && !(lock.expiresAt < where.expiresAt.lt)) return false;
        return true;
      });
    },
    createMany: async (args: any) => {
      const data = Array.isArray(args?.data) ? args.data : [];
      data.forEach((entry) => seatLocks.push({ id: ensureId(entry.id), ...entry }));
      return { count: data.length };
    },
    deleteMany: async (args: any) => {
      const where = args?.where ?? {};
      const ids = new Set(where.id?.in ?? []);
      const toRemove = seatLocks.filter((lock) => {
        if (ids.size && ids.has(lock.id)) return true;
        if (where.eventId && lock.eventId !== where.eventId) return false;
        if (Array.isArray(where.seatId?.in) && !where.seatId.in.includes(lock.seatId)) return false;
        if (where.sessionId && lock.sessionId !== where.sessionId) return false;
        return !ids.size && (!where.seatId?.in || where.seatId.in.includes(lock.seatId));
      });
      const deleteIds = new Set(toRemove.map((l) => l.id));
      const before = seatLocks.length;
      for (let i = seatLocks.length - 1; i >= 0; i -= 1) {
        if (deleteIds.has(seatLocks[i].id)) seatLocks.splice(i, 1);
      }
      return { count: before - seatLocks.length };
    },
    delete: async (args: any) => {
      const id = args?.where?.id;
      const idx = seatLocks.findIndex((lock) => lock.id === id);
      if (idx >= 0) {
        const [removed] = seatLocks.splice(idx, 1);
        return removed;
      }
      throw new Error("SeatLock not found");
    },
  };

  waterSeatLock = {
    findFirst: async (args?: any) => {
      const where = args?.where ?? {};
      return (
        waterSeatLocks.find(
          (lock) =>
            (!where.eventId || where.eventId === lock.eventId) &&
            (!where.seatCode || where.seatCode === lock.seatCode),
        ) ?? null
      );
    },
    findMany: async (args?: any) => {
      const where = args?.where ?? {};
      return waterSeatLocks.filter((lock) => {
        if (where.eventId && lock.eventId !== where.eventId) return false;
        if (where.sessionId && lock.sessionId !== where.sessionId) return false;
        if (where.seatCode && lock.seatCode !== where.seatCode) return false;
        if (where.seatCode?.in && Array.isArray(where.seatCode.in) && !where.seatCode.in.includes(lock.seatCode)) return false;
        return true;
      });
    },
    create: async (args: any) => {
      const entry = { id: ensureId(args?.data?.id), ...args.data };
      waterSeatLocks.push(entry);
      return entry;
    },
    createMany: async (args: any) => {
      const data = Array.isArray(args?.data) ? args.data : [];
      data.forEach((entry) => waterSeatLocks.push({ id: ensureId(entry.id), ...entry }));
      return { count: data.length };
    },
    deleteMany: async (args: any) => {
      const where = args?.where ?? {};
      const toRemove = waterSeatLocks.filter((lock) => {
        if (where.eventId && lock.eventId !== where.eventId) return false;
        if (where.sessionId && lock.sessionId !== where.sessionId) return false;
        if (where.seatCode && lock.seatCode !== where.seatCode) return false;
        if (Array.isArray(where.seatCode?.in) && !where.seatCode.in.includes(lock.seatCode)) return false;
        return true;
      });
      const deleteIds = new Set(toRemove.map((l) => l.id));
      for (let i = waterSeatLocks.length - 1; i >= 0; i -= 1) {
        if (deleteIds.has(waterSeatLocks[i].id)) waterSeatLocks.splice(i, 1);
      }
      return { count: deleteIds.size };
    },
  };

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
