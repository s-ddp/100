import { Router } from "../vendor/express";
import { astraClient } from "../core/astraClient";
import { getPrismaClient } from "../core/prisma";
import {
  buildSeatStatus,
  findPrice,
  findSeatMapForEvent,
  getSeatCategoryForSeat,
  listTicketTypes,
  listVessels,
  nextTripForEvent,
  reservationKey,
  resolveEvent,
  resolveTrip,
  seatReservations,
} from "../core/waterStore";
import { waterEvents, waterSeatPrices, waterSeatMaps, waterTrips, waterVessels } from "../water-data";
import { emitSeatStatus } from "../ws/seatmapHub";

export const eventsRouter = Router();
const seatLockTtlMs = Number(process.env.SEAT_LOCK_TTL_MS ?? 10 * 60 * 1000);

eventsRouter.get("/", async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query ?? {};

    const astra = await astraClient.getEvents({
      dateFrom: typeof dateFrom === "string" ? dateFrom : undefined,
      dateTo: typeof dateTo === "string" ? dateTo : undefined,
    });

    const events = (astra.events.length
      ? astra.events.map((ev) => {
          const waterEvent = resolveEvent(ev.serviceID || ev.eventID);
          const nextTrip = waterEvent ? nextTripForEvent(waterEvent.id) : null;
          const datetime = ev.eventDateTime ?? nextTrip?.departureDateTime ?? null;

          return {
            id: waterEvent?.id ?? ev.eventID,
            name: ev.eventName,
            title: waterEvent?.title ?? ev.eventName,
            datetime,
            serviceId: ev.serviceID,
            serviceName: ev.serviceName,
            venueName: ev.venueName,
            pierName: ev.pierName ?? nextTrip?.pierStart,
            endPointName: ev.endPointName ?? nextTrip?.pierEnd,
            duration: ev.eventDuration ?? waterEvent?.durationMinutes,
            availableSeats: ev.availableSeats ?? nextTrip?.availableSeats,
            freeSeating: ev.eventFreeSeating,
            noSeats: ev.eventNoSeats,
            city: waterEvent?.city,
            category: waterEvent?.category,
            hasSeating: waterEvent?.hasSeating,
            image: waterEvent?.image,
          };
        })
      : waterEvents.map((event) => {
          const nextTrip = nextTripForEvent(event.id);
          return {
            id: event.id,
            name: event.title,
            title: event.title,
            datetime: nextTrip?.departureDateTime ?? null,
            serviceId: event.id,
            serviceName: event.title,
            venueName: event.city,
            pierName: nextTrip?.pierStart ?? event.pierStart,
            endPointName: nextTrip?.pierEnd ?? event.pierEnd,
            duration: event.durationMinutes,
            availableSeats: nextTrip?.availableSeats,
            freeSeating: !event.hasSeating,
            noSeats: !event.hasSeating,
            city: event.city,
            category: event.category,
            hasSeating: event.hasSeating,
            image: event.image,
          };
        }));

    res.json({ events, total: events.length });
  } catch (err) {
    next(err);
  }
});

eventsRouter.get("/:eventId", async (req, res, next) => {
  try {
    const { eventId } = req.params ?? {};
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    const waterEvent = resolveEvent(eventId);

    if (waterEvent) {
      const prisma = getPrismaClient();
      const seatLocks = prisma
        ? await (prisma as any).waterSeatLock.findMany({ where: { eventId: waterEvent.id } })
        : [];
      const vessel = listVessels().find((v) => v.id === waterEvent.vesselId);
      const seatMap = buildSeatStatus(waterEvent.id, undefined, seatLocks);
      const trips = waterTrips.filter((trip) => trip.eventId === waterEvent.id);
      return res.json({
        event: {
          ...waterEvent,
          vessel,
          seatMap,
          trips,
        },
      });
    }

    const astra = await astraClient.getEvents({ eventID: eventId });
    const ev = astra.events[0];
    if (!ev) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({
      id: ev.eventID,
      name: ev.eventName,
      datetime: ev.eventDateTime,
      serviceId: ev.serviceID,
      serviceName: ev.serviceName,
      venueName: ev.venueName,
      pierName: ev.pierName,
      endPointName: ev.endPointName,
      duration: ev.eventDuration,
      availableSeats: ev.availableSeats,
      freeSeating: ev.eventFreeSeating,
      noSeats: ev.eventNoSeats,
    });
  } catch (err) {
    next(err);
  }
});

eventsRouter.get("/:eventId/seat-layout", async (req, res, next) => {
  try {
    const { eventId } = req.params ?? {};
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    const prisma = getPrismaClient();

    const seatLocks = prisma ? await (prisma as any).waterSeatLock.findMany({ where: { eventId } }) : [];
    const seatLayout = buildSeatStatus(eventId, undefined, seatLocks);
    if (seatLayout) {
      return res.json(seatLayout);
    }

    if (prisma) {
      try {
        const eventRecord: any = await (prisma as any).event.findUnique({
          where: { id: eventId },
          include: {
            vessel: {
              include: {
                decks: {
                  include: {
                    areas: {
                      include: { seats: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (eventRecord?.vessel) {
          const layout = {
            eventId: eventRecord.id,
            vesselId: eventRecord.vessel.id,
            vesselName: eventRecord.vessel.name,
            levels: eventRecord.vessel.decks.map((deck: any) => ({
              id: deck.id,
              name: deck.name ?? `Палуба ${deck.deckNumber}`,
              backgroundSvg: deck.backgroundSvg ?? undefined,
              areas: deck.areas.map((area: any) => ({
                id: area.id,
                name: area.name,
                category: area.category ?? undefined,
                color: area.color ?? undefined,
                seats: area.seats.map((seat: any) => ({
                  id: seat.id,
                  seatCode: seat.seatCode,
                  alias: seat.alias ?? seat.seatCode,
                  x: seat.x ?? undefined,
                  y: seat.y ?? undefined,
                  ticketsPerSeat: seat.ticketsPerSeat,
                })),
              })),
            })),
          };

          return res.json(layout);
        }
      } catch (dbError) {
        console.warn("Falling back to fixture seat layout", dbError);
      }
    }

    const fallback = buildFixtureSeatLayout(eventId);
    if (!fallback) {
      return res.status(404).json({ error: "Seat layout not found" });
    }

    res.json(fallback);
  } catch (err) {
    next(err);
  }
});

eventsRouter.get("/:eventId/trips", (req, res) => {
  const { eventId } = req.params ?? {};
  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }

  const event = resolveEvent(eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const trips = waterTrips.filter((trip) => trip.eventId === event.id);
  return res.json({ eventId: event.id, trips, total: trips.length });
});

eventsRouter.get("/:eventId/categories", (req, res) => {
  const { eventId } = req.params ?? {};
  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }

  const event = resolveEvent(eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const seatMap = findSeatMapForEvent(event.id);
  const categories =
    seatMap?.areas.map((area: any) => ({
      id: area.id,
      name: area.name,
      priceFrom: waterSeatPrices.find((price) => price.eventId === event.id && price.seatCategoryId === area.id)?.price,
      seats: area.seats.length,
    })) ?? [];

  return res.json({ eventId: event.id, categories, total: categories.length });
});

eventsRouter.get("/:eventId/seats", async (req, res, next) => {
  try {
    const { eventId } = req.params ?? {};
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    const prisma = getPrismaClient();
    const event = resolveEvent(eventId);
    if (event) {
      const seatLocks = prisma ? await (prisma as any).waterSeatLock.findMany({ where: { eventId: event.id } }) : [];
      const trip = typeof req.query?.tripId === "string" ? resolveTrip(req.query.tripId) : null;
      const seatMap = buildSeatStatus(event.id, trip?.id, seatLocks);
      const seats =
        seatMap?.areas.flatMap((area: any) =>
          area.seats.map((seat: any) => ({
            seatId: seat.id,
            alias: seat.alias ?? seat.seatCode,
            status: seat.status,
            seatCategoryId: area.id,
            seatCategoryName: area.name,
            ticketsPerSeat: seat.ticketsPerSeat ?? 1,
            availableTickets: seat.ticketsPerSeat ?? 1,
            reservation: seat.reservation,
          })),
        ) ?? [];
      return res.json({ eventId: event.id, seats });
    }

    const astraSeats = await astraClient.getSeatsOnEvent({ eventID: eventId });

    const seats = astraSeats.seats.map((s) => ({
      seatId: s.seatID,
      alias: s.aliasSeat,
      status: mapAstraSeatStatus(s.seatStatus),
      seatCategoryId: s.seatCategoryID,
      seatCategoryName: s.seatCategoryName,
      ticketsPerSeat: s.numberOfTicketsPerSeat,
      availableTickets: s.availableSeats,
    }));

    res.json({ eventId, seats });
  } catch (err) {
    next(err);
  }
});

eventsRouter.get("/:eventId/ticket-types", async (req, res, next) => {
  try {
    const { eventId } = req.params ?? {};
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    const event = resolveEvent(eventId);
    if (event) {
      return res.json({ eventId: event.id, ticketTypes: listTicketTypes(), total: listTicketTypes().length });
    }

    const astraResp = await astraClient.getTicketTypes({
      eventID: eventId,
      email: process.env.ASTRA_EMAIL ?? undefined,
    });

    res.json({ eventId, ticketTypes: astraResp.ticketTypes ?? [] });
  } catch (err) {
    next(err);
  }
});

eventsRouter.get("/:eventId/prices", async (req, res, next) => {
  try {
    const { eventId } = req.params ?? {};
    const { ticketTypeId, seatCategoryId, paymentTypeID, resident } = req.query ?? {};

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    if (!ticketTypeId || typeof ticketTypeId !== "string") {
      return res.status(400).json({ error: "ticketTypeId is required" });
    }

    const event = resolveEvent(eventId);
    if (event) {
      const prices = waterSeatPrices.filter((price) => {
        if (price.eventId !== event.id) return false;
        if (seatCategoryId && price.seatCategoryId !== seatCategoryId) return false;
        if (ticketTypeId && price.ticketTypeId !== ticketTypeId) return false;
        return true;
      });
      return res.json({ eventId: event.id, prices, total: prices.length });
    }

    const astraResp = await astraClient.getSeatPrices({
      eventID: eventId,
      ticketTypeID: ticketTypeId,
      seatCategoryID: typeof seatCategoryId === "string" ? seatCategoryId : "",
      paymentTypeID: typeof paymentTypeID === "string" ? paymentTypeID : "",
      resident: resident === undefined ? "" : resident === "true",
      email: process.env.ASTRA_EMAIL ?? undefined,
    });

    res.json({ eventId, prices: astraResp.seatPrices ?? [] });
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/:eventId/seats/lock", async (req, res, next) => {
  try {
    const { eventId } = req.params ?? {};
    const { sessionId, seats, email } = req.body as {
      sessionId: string;
      seats: string[];
      email?: string;
    };

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    if (!sessionId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: "sessionId and seats[] are required" });
    }

    const prisma = getPrismaClient();
    const locked: string[] = [];
    const failed: { seatId: string; reason: string }[] = [];

    for (const seatId of seats) {
      try {
        const result = await astraClient.bookingSeat({
          eventID: eventId,
          sessionID: sessionId,
          seatID: seatId,
          email,
        });

        if (result.isSeatBooked) {
          locked.push(seatId);

          if (prisma) {
            await (prisma as any).waterSeatLock.create({
              data: {
                eventId,
                seatCode: seatId,
                sessionId,
                lockedAt: new Date(),
                expiresAt: new Date(Date.now() + seatLockTtlMs),
              },
            });
          }

          emitSeatStatus(eventId, seatId, "selected");
        } else {
          failed.push({ seatId, reason: result.descriptionSeatBooked });
        }
      } catch (e: any) {
        failed.push({ seatId, reason: e?.message ?? "error" });
      }
    }

    res.json({ eventId, sessionId, locked, failed });
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/:eventId/seats/unlock", async (req, res, next) => {
  try {
    const { eventId } = req.params ?? {};
    const { sessionId, seats, email } = req.body as {
      sessionId: string;
      seats?: string[];
      email?: string;
    };

    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const prisma = getPrismaClient();

    if (!Array.isArray(seats) || seats.length === 0) {
      const lockedSeats = prisma
        ? await (prisma as any).waterSeatLock.findMany({ where: { eventId, sessionId } })
        : [];

      await astraClient.cancelBookSeat({
        eventID: eventId,
        sessionID: sessionId,
        seatID: "",
        email,
      });

      if (prisma) {
        await (prisma as any).waterSeatLock.deleteMany({
          where: { eventId, sessionId },
        });
      }

      lockedSeats.forEach((lock: any) => emitSeatStatus(eventId, lock.seatCode, "free"));

      return res.json({ eventId, sessionId, unlockedAll: true });
    }

    const unlocked: string[] = [];
    const failed: { seatId: string; reason: string }[] = [];

    for (const seatId of seats) {
      try {
        const result = await astraClient.cancelBookSeat({
          eventID: eventId,
          sessionID: sessionId,
          seatID: seatId,
          email,
        });

        if (result.isCanceledBookSeat) {
          unlocked.push(seatId);
          if (prisma) {
            await (prisma as any).waterSeatLock.deleteMany({
              where: { eventId, sessionId, seatCode: seatId },
            });
          }
          emitSeatStatus(eventId, seatId, "free");
        } else {
          failed.push({ seatId, reason: result.descriptionSeatBooked });
        }
      } catch (e: any) {
        failed.push({ seatId, reason: e?.message ?? "error" });
      }
    }

    res.json({ eventId, sessionId, unlocked, failed });
  } catch (err) {
    next(err);
  }
});

eventsRouter.post("/:eventId/book", async (req, res) => {
  const { eventId } = req.params ?? {};
  const { sessionID, seatID, tripId } = req.body ?? {};

  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }
  if (!sessionID || !seatID) {
    return res.status(400).json({ error: "sessionID and seatID are required" });
  }

  const event = resolveEvent(eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const trip = tripId ? resolveTrip(tripId) : null;
  if (tripId && !trip) {
    return res.status(404).json({ error: "Trip not found", tripId });
  }

  const seatMap = findSeatMapForEvent(event.id);
  const category = getSeatCategoryForSeat(seatMap, seatID);
  if (!category) {
    return res.status(404).json({ error: "Seat not found", seatID });
  }

  const key = reservationKey(event.id, trip?.id ?? tripId, seatID);
  const existing = seatReservations.get(key);
  if (existing && existing.sessionId !== sessionID && existing.status !== "sold") {
    return res.status(409).json({ error: "Seat already reserved", seatID });
  }

  const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const reservation = {
    sessionId: sessionID,
    seatId: seatID,
    eventId: event.id,
    tripId: trip?.id ?? tripId,
    status: "reserved" as const,
    holdExpiresAt,
  };
  seatReservations.set(key, reservation);
  emitSeatStatus(event.id, seatID, "reserved");

  return res.status(201).json({ reservation });
});

eventsRouter.post("/:eventId/unbook", async (req, res) => {
  const { eventId } = req.params ?? {};
  const { sessionID, seatID, tripId } = req.body ?? {};

  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }
  if (!sessionID || !seatID) {
    return res.status(400).json({ error: "sessionID and seatID are required" });
  }

  const event = resolveEvent(eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const key = reservationKey(event.id, tripId, seatID);
  const existing = seatReservations.get(key);
  if (!existing) {
    return res.status(404).json({ error: "Reservation not found", seatID });
  }
  if (existing.sessionId !== sessionID) {
    return res.status(403).json({ error: "Reservation belongs to another session", seatID });
  }

  seatReservations.delete(key);
  emitSeatStatus(event.id, seatID, "free");

  return res.json({ released: seatID });
});

function buildFixtureSeatLayout(eventId: string) {
  const trip = waterTrips.find((t) => t.id === eventId || t.eventId === eventId);
  const event = trip
    ? waterEvents.find((ev) => ev.id === trip.eventId)
    : waterEvents.find((ev) => ev.id === eventId);

  if (!event) return null;

  const vessel = waterVessels.find((v) => v.id === (trip?.vesselId ?? event.vesselId));
  if (!vessel) return null;
  const maps = waterSeatMaps.filter(
    (m) => m.vesselId === vessel.id || (event.seatMapId && m.id === event.seatMapId),
  );

  return {
    eventId,
    vesselId: vessel.id,
    vesselName: vessel.name,
    levels: maps.map((deck) => ({
      id: deck.id,
      name: deck.name,
      backgroundSvg: deck.backgroundSvg,
      areas: deck.areas.map((area) => ({
        id: area.id,
        name: area.name,
        category: area.category,
        color: area.color,
        seats: area.seats.map((seat) => ({
          id: seat.id,
          seatCode: seat.seatCode,
          alias: seat.alias,
          x: seat.x,
          y: seat.y,
          ticketsPerSeat: seat.ticketsPerSeat,
        })),
      })),
    })),
  };
}

function mapAstraSeatStatus(
  status: string,
): "free" | "sold" | "reserved" | "selected" | "unknown" {
  switch (status) {
    case "Свободно":
      return "free";
    case "Продано":
      return "sold";
    case "Бронь":
      return "reserved";
    case "Выбрано":
      return "selected";
    default:
      return "unknown";
  }
}
