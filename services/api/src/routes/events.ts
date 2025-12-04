import { Router } from "../vendor/express.js";
import { astraClient } from "../core/astraClient.js";
import { getPrismaClient } from "../core/prisma.js";
import { waterEvents, waterSeatMaps, waterTrips, waterVessels } from "../water-data.js";

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query ?? {};

    const astra = await astraClient.getEvents({
      dateFrom: typeof dateFrom === "string" ? dateFrom : undefined,
      dateTo: typeof dateTo === "string" ? dateTo : undefined,
    });

    const events = astra.events.map((ev) => ({
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
    }));

    res.json({ events });
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
        // fall back to fixtures
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

eventsRouter.get("/:eventId/seats", async (req, res, next) => {
  try {
    const { eventId } = req.params ?? {};
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
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

    const astraResp = await astraClient.getSeatPrices({
      eventID: eventId,
      ticketTypeID: ticketTypeId,
      seatCategoryID: typeof seatCategoryId === "string" ? seatCategoryId : "",
      paymentTypeID: typeof paymentTypeID === "string" ? paymentTypeID : "",
      resident: resident === undefined ? "" : String(resident) === "true",
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
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    const { sessionId, seats, email } = req.body as {
      sessionId: string;
      seats: string[];
      email?: string;
    };

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
            await (prisma as any).seatLock.create({
              data: {
                eventId,
                seatCode: seatId,
                sessionId,
                lockedAt: new Date(),
                expiresAt: addMinutes(new Date(), 5),
              },
            });
          }
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
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }
    const { sessionId, seats, email } = req.body as {
      sessionId: string;
      seats?: string[];
      email?: string;
    };

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const prisma = getPrismaClient();

    if (!Array.isArray(seats) || seats.length === 0) {
      await astraClient.cancelBookSeat({ eventID: eventId, sessionID: sessionId, seatID: "", email });
      if (prisma) {
        await (prisma as any).seatLock.deleteMany({ where: { eventId, sessionId } });
      }
      return res.json({ eventId, sessionId, unlockedAll: true });
    }

    const unlocked: string[] = [];
    const failed: { seatId: string; reason: string }[] = [];

    for (const seatId of seats) {
      try {
        const result = await astraClient.cancelBookSeat({ eventID: eventId, sessionID: sessionId, seatID: seatId, email });
        if (result.isCanceledBookSeat) {
          unlocked.push(seatId);
          if (prisma) {
            await (prisma as any).seatLock.deleteMany({ where: { eventId, sessionId, seatCode: seatId } });
          }
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

function mapAstraSeatStatus(status: string): "free" | "sold" | "reserved" | "selected" | "unknown" {
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

function buildFixtureSeatLayout(eventId: string) {
  const trip = waterTrips.find((t) => t.id === eventId || t.eventId === eventId);
  const event = waterEvents.find((e) => e.id === (trip?.eventId ?? eventId));
  if (!event) return null;

  const vessel = waterVessels.find((v) => v.id === event.vesselId);
  const seatMap = waterSeatMaps.find((s) => s.id === event.seatMapId);
  if (!vessel || !seatMap) return null;

  return {
    eventId,
    vesselId: vessel.id,
    vesselName: vessel.name,
    levels: [
      {
        id: `${vessel.id}_deck`,
        name: "Палуба 1",
        backgroundSvg: seatMap.image,
        areas: seatMap.areas.map((area) => ({
          id: area.id,
          name: area.name,
          category: area.id,
          seats: area.seats.map((seat: any) => ({
            id: `${area.id}_${seat.id}`,
            seatCode: seat.id,
            alias: seat.id,
            x: seat.x,
            y: seat.y,
            ticketsPerSeat: (seat as any).ticketsPerSeat ?? 1,
          })),
        })),
      },
    ],
  };
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}
