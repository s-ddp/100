import {
  waterEvents,
  waterSeatMaps,
  waterSeatPrices,
  waterTicketTypes,
  waterTrips,
  waterVessels,
} from "../water-data";

export type SeatReservationStatus = "reserved" | "sold";

export interface SeatReservation {
  eventId: string;
  tripId?: string | null;
  seatId: string;
  sessionId: string;
  status: SeatReservationStatus;
  holdExpiresAt?: string;
  orderId?: string;
}

export interface WaterSeatOrder {
  id: string;
  type: "seat-order";
  status: "pending_payment" | "confirmed";
  createdAt: string;
  eventId: string;
  tripId?: string;
  seats: string[];
  ticketTypeId: string;
  totals: { gross: number; currency: string; vatRate: number; vatMode: string };
  customer: { name: string; phone: string; email?: string };
}

export const seatReservations = new Map<string, SeatReservation>();
export const seatOrders: WaterSeatOrder[] = [];

export function resetWaterState() {
  seatReservations.clear();
  seatOrders.length = 0;
}

export function reservationKey(eventId: string, tripId: string | undefined | null, seatId: string) {
  return `${eventId}:${tripId ?? "na"}:${seatId}`;
}

export function resolveEvent(eventIdOrTripId: string) {
  const event = waterEvents.find((entry) => entry.id === eventIdOrTripId);
  if (event) return event;

  const trip = waterTrips.find((entry) => entry.id === eventIdOrTripId);
  if (trip) {
    return waterEvents.find((entry) => entry.id === trip.eventId) ?? null;
  }

  return null;
}

export function resolveTrip(tripIdOrEventId: string) {
  const trip = waterTrips.find((entry) => entry.id === tripIdOrEventId);
  if (trip) return trip;

  return waterTrips.find((entry) => entry.eventId === tripIdOrEventId) ?? null;
}

export function findSeatMapForEvent(eventIdOrTripId: string) {
  const event = resolveEvent(eventIdOrTripId);
  if (!event?.seatMapId) return null;
  return waterSeatMaps.find((map) => map.id === event.seatMapId) ?? null;
}

export function getSeatCategoryForSeat(seatMap: any, seatId: string) {
  if (!seatMap) return null;
  for (const area of seatMap.areas) {
    if (area.seats.some((seat: any) => seat.id === seatId)) {
      return area;
    }
  }
  return null;
}

export function nextTripForEvent(eventId: string) {
  return waterTrips
    .filter((trip) => trip.eventId === eventId)
    .map((trip) => ({
      ...trip,
      departureDateTime: new Date(`${trip.date}T${trip.time}:00`).toISOString(),
    }))
    .sort((a, b) => new Date(a.departureDateTime).getTime() - new Date(b.departureDateTime).getTime())[0] ?? null;
}

export function findPrice(eventId: string, seatCategoryId: string, ticketTypeId: string) {
  return waterSeatPrices.find(
    (price) => price.eventId === eventId && price.seatCategoryId === seatCategoryId && price.ticketTypeId === ticketTypeId,
  );
}

export function listTicketTypes() {
  return waterTicketTypes;
}

export function listVessels() {
  return waterVessels;
}

type SeatLock = {
  seatCode?: string | null;
  sessionId?: string | null;
  expiresAt?: Date | string | null;
};

function normalizeSeatStatus(
  status?: string | null,
): "free" | "sold" | "reserved" | "selected" | "unknown" {
  if (!status) return "free";
  const lowered = status.toLowerCase();
  if (lowered === "available" || lowered === "free") return "free";
  if (lowered === "sold") return "sold";
  if (lowered === "reserved" || lowered === "locked") return "reserved";
  if (lowered === "selected") return "selected";
  return "unknown";
}

export function buildSeatStatus(eventId: string, tripId?: string | null, seatLocks: SeatLock[] = []) {
  const event = resolveEvent(eventId);
  const trip = tripId ? resolveTrip(tripId) : null;
  const seatMap = findSeatMapForEvent(eventId);
  if (!seatMap) return null;

  const mapSeat = (seat: any) => {
    const reservation =
      seatReservations.get(reservationKey(eventId, tripId, seat.id)) ||
      seatReservations.get(reservationKey(eventId, null, seat.id));
    const dbLock = seatLocks.find((lock) => lock.seatCode === seat.id || lock.seatCode === seat.seatCode);
    const status = reservation?.status === "sold"
      ? "sold"
      : reservation?.status === "reserved" || dbLock
        ? "reserved"
        : normalizeSeatStatus(seat.status);
    const holdExpiresAt =
      reservation?.holdExpiresAt ?? (dbLock?.expiresAt ? new Date(dbLock.expiresAt).toISOString() : undefined);

    return {
      ...seat,
      status,
      reservation:
        (reservation || dbLock) && status !== "free"
          ? {
              sessionID: reservation?.sessionId ?? dbLock?.sessionId ?? undefined,
              status,
              holdExpiresAt,
              orderId: reservation?.orderId,
            }
          : undefined,
    };
  };

  return {
    eventId: event?.id ?? eventId,
    tripId: trip?.id ?? tripId ?? undefined,
    vesselId: event?.vesselId ?? seatMap.vesselId,
    vesselName: listVessels().find((v) => v.id === (event?.vesselId ?? seatMap.vesselId))?.name,
    ...seatMap,
    areas: seatMap.areas.map((area) => ({
      ...area,
      seats: area.seats.map(mapSeat),
    })),
    levels: [
      {
        id: seatMap.id,
        name: seatMap.name ?? "Deck",
        backgroundSvg: seatMap.backgroundSvg,
        areas: seatMap.areas.map((area) => ({
          ...area,
          seats: area.seats.map(mapSeat),
        })),
      },
    ],
  };
}


export function createSeatOrder(params: {
  eventId: string;
  tripId?: string;
  seats: string[];
  ticketTypeId: string;
  customer: { name: string; phone: string; email?: string };
  sessionId?: string;
  vatRate?: number;
  vatMode?: string;
}) {
  const { eventId, tripId, seats, ticketTypeId, customer, sessionId, vatMode = "included", vatRate = 0.2 } = params;
  const order: WaterSeatOrder = {
    id: `order_${Math.random().toString(16).slice(2)}${Date.now()}`,
    type: "seat-order",
    status: "pending_payment",
    createdAt: new Date().toISOString(),
    eventId,
    tripId,
    seats,
    ticketTypeId,
    totals: { gross: 0, currency: "RUB", vatRate, vatMode },
    customer,
  };

  seatOrders.push(order);
  return order;
}
