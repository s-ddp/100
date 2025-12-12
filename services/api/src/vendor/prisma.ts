const seatMaps: any[] = [];
const seats: any[] = [];
const seatLocks: any[] = [];
const waterSeatLocks: any[] = [];
const orders: any[] = [];
const orderSeats: any[] = [];
const payments: any[] = [];

let seatMapCounter = 0;
let seatCounter = 0;
let seatLockCounter = 0;
let orderCounter = 0;
let orderSeatCounter = 0;

function ensureNumericId(value: any, counterRef: () => number) {
  if (value !== undefined && value !== null) return value;
  return counterRef();
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
      const entry = {
        id: ensureNumericId(args?.data?.id, () => ++seatMapCounter),
        ...args.data,
      };
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
      data.forEach((entry) =>
        seats.push({ id: ensureNumericId(entry.id, () => ++seatCounter), ...entry }),
      );
      return { count: data.length };
    },
  };

  seatLock = {
    findMany: async (args?: any) => {
      const where = args?.where ?? {};
      return seatLocks.filter((lock) => {
        if (where.eventId && lock.eventId !== where.eventId) return false;
        if (where.seatId && lock.seatId !== where.seatId) return false;
        if (Array.isArray(where.seatId?.in) && !where.seatId.in.includes(lock.seatId)) return false;
        const lockUntil = lock.lockedUntil ?? lock.expiresAt;
        if (where.lockedUntil?.gt && !(lockUntil > where.lockedUntil.gt)) return false;
        if (where.lockedUntil?.lt && !(lockUntil < where.lockedUntil.lt)) return false;
        if (where.expiresAt?.gt && !(lockUntil > where.expiresAt.gt)) return false;
        if (where.expiresAt?.lt && !(lockUntil < where.expiresAt.lt)) return false;
        if (where.status && lock.status !== where.status) return false;
        return true;
      });
    },
    createMany: async (args: any) => {
      const data = Array.isArray(args?.data) ? args.data : [];
      data.forEach((entry) =>
        seatLocks.push({
          id: ensureNumericId(entry.id, () => ++seatLockCounter),
          status: entry.status ?? "LOCKED",
          lockedUntil: entry.lockedUntil ?? entry.expiresAt,
          bySessionId: entry.bySessionId ?? entry.sessionId,
          ...entry,
        }),
      );
      return { count: data.length };
    },
    updateMany: async (args: any) => {
      const where = args?.where ?? {};
      const data = args?.data ?? {};
      let count = 0;
      seatLocks.forEach((lock, idx) => {
        const lockUntil = lock.lockedUntil ?? lock.expiresAt;
        if (where.eventId && lock.eventId !== where.eventId) return;
        if (where.seatId && lock.seatId !== where.seatId) return;
        if (where.status && lock.status !== where.status) return;
        if (where.lockedUntil?.lt && !(lockUntil < where.lockedUntil.lt)) return;
        seatLocks[idx] = { ...lock, ...data };
        count += 1;
      });
      return { count };
    },
    deleteMany: async (args: any) => {
      const where = args?.where ?? {};
      const ids = new Set(where.id?.in ?? []);
      const toRemove = seatLocks.filter((lock) => {
        if (ids.size && ids.has(lock.id)) return true;
        if (where.eventId && lock.eventId !== where.eventId) return false;
        if (Array.isArray(where.seatId?.in) && !where.seatId.in.includes(lock.seatId)) return false;
        if (where.sessionId && lock.bySessionId !== where.sessionId) return false;
        if (where.bySessionId && lock.bySessionId !== where.bySessionId) return false;
        return !ids.size && (!where.seatId?.in || where.seatId.in.includes(lock.seatId));
      });
      const deleteIds = new Set(toRemove.map((l) => l.id));
      const before = seatLocks.length;
      for (let i = seatLocks.length - 1; i >= 0; i -= 1) {
        if (deleteIds.has(seatLocks[i].id)) seatLocks.splice(i, 1);
      }
      return { count: before - seatLocks.length };
    },
    update: async (args: any) => {
      const where = args?.where ?? {};
      const data = args?.data ?? {};
      const idx = seatLocks.findIndex((lock) => lock.id === where.id);
      if (idx === -1) throw new Error("SeatLock not found");
      seatLocks[idx] = { ...seatLocks[idx], ...data };
      return seatLocks[idx];
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
      const entry = { id: args?.data?.id ?? `id-${Math.random().toString(16).slice(2)}`, ...args.data };
      waterSeatLocks.push(entry);
      return entry;
    },
    createMany: async (args: any) => {
      const data = Array.isArray(args?.data) ? args.data : [];
      data.forEach((entry) =>
        waterSeatLocks.push({ id: entry.id ?? `id-${Math.random().toString(16).slice(2)}`, ...entry }),
      );
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
    create: async (args?: any) => {
      const entry = { id: args?.data?.id ?? `order-${++orderCounter}`, ...(args?.data ?? {}) };
      orders.push(entry);
      return entry;
    },
    findUnique: async (args?: any) => {
      const id = args?.where?.id;
      const order = orders.find((o) => o.id === id) ?? null;
      if (order && args?.include?.seats) {
        const seatsForOrder = orderSeats.filter((seat) => seat.orderId === order.id);
        return { ...order, seats: seatsForOrder };
      }
      return order ?? null;
    },
    findMany: async (args?: any) => {
      const where = args?.where ?? {};
      return orders.filter((order) => {
        if (where.id && order.id !== where.id) return false;
        if (Array.isArray(where.id?.in) && !where.id.in.includes(order.id)) return false;
        if (where.status && Array.isArray(where.status?.in) && !where.status.in.includes(order.status)) return false;
        if (where.status && typeof where.status === "string" && order.status !== where.status) return false;
        return true;
      });
    },
    update: async (args?: any) => {
      const id = args?.where?.id;
      const idx = orders.findIndex((order) => order.id === id);
      if (idx === -1) throw new Error("Order not found");
      orders[idx] = { ...orders[idx], ...(args?.data ?? {}) };
      return orders[idx];
    },
  };
  orderItem = { create: async (_args?: any) => ({}) };
  orderSeat = {
    createMany: async (args?: any) => {
      const data = Array.isArray(args?.data) ? args.data : [];
      data.forEach((entry) =>
        orderSeats.push({ id: ensureNumericId(entry.id, () => ++orderSeatCounter), ...entry }),
      );
      return { count: data.length };
    },
    findMany: async (args?: any) => {
      const where = args?.where ?? {};
      const includeOrder = Boolean(args?.include?.order);
      return orderSeats
        .filter((seat) => {
          if (where.seatId && seat.seatId !== where.seatId) return false;
          if (Array.isArray(where.seatId?.in) && !where.seatId.in.includes(seat.seatId)) return false;
          if (where.orderId && seat.orderId !== where.orderId) return false;
          return true;
        })
        .map((seat) => {
          if (includeOrder) {
            const order = orders.find((o) => o.id === seat.orderId) ?? null;
            return { ...seat, order };
          }
          return seat;
        });
    },
  };
  payment = {
    create: async (args?: any) => {
      const entry = { id: args?.data?.id ?? `payment-${Math.random().toString(16).slice(2)}`, ...(args?.data ?? {}) };
      payments.push(entry);
      return entry;
    },
    update: async (args?: any) => {
      const id = args?.where?.id;
      const idx = payments.findIndex((payment) => payment.id === id);
      if (idx === -1) throw new Error("Payment not found");
      payments[idx] = { ...payments[idx], ...(args?.data ?? {}) };
      return payments[idx];
    },
  };
  async $disconnect() {
    return;
  }
}
