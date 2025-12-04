import { waterEvents, waterSeatMaps, waterTrips } from "../water-data.js";

export interface AstraEvent {
  eventID: string;
  eventName: string;
  eventDateTime: string;
  serviceID: string;
  serviceName: string;
  venueID?: string;
  venueName?: string;
  eventFreeSeating: boolean;
  eventNoSeats: boolean;
  pierID?: string;
  pierName?: string;
  endPointID?: string;
  endPointName?: string;
  eventDuration?: number;
  availableSeats?: number;
}

export interface AstraSeat {
  seatID: string;
  aliasSeat: string;
  seatStatus: string;
  seatCategoryName: string;
  seatCategoryID: string;
  numberOfTicketsPerSeat: number;
  availableSeats: number;
}

interface AstraTicketTypeResponse {
  ticketTypes: { ticketTypeID: string; ticketTypeName: string }[];
}

interface AstraSeatPriceResponse {
  seatPrices: {
    seatCategoryID: string;
    seatCategoryName?: string;
    ticketTypeID?: string;
    priceTypeID?: string;
    priceTypeName?: string;
    priceValue?: number;
    hasMenu?: boolean;
    menu?: unknown;
  }[];
}

const useStub = process.env.ASTRA_USE_STUB !== "false";

const lockState = new Map<string, { sessionId: string; lockedAt: number }>();

async function post<T>(method: string, body: unknown): Promise<T> {
  const baseUrl = process.env.ASTRA_BASE_URL;
  const auth = process.env.ASTRA_AUTH;

  if (!baseUrl || useStub) {
    return stubCall<T>(method, body);
  }

  const res = await fetch(`${baseUrl}/${method}`, {
    method: "POST",
    headers: {
      Authorization: auth ?? "",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Astra API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

function stubCall<T>(method: string, body: any): any {
  switch (method) {
    case "getEvents": {
      const { eventID } = body ?? {};
      const events = waterTrips
        .map((trip) => {
          const event = waterEvents.find((e) => e.id === trip.eventId);
          if (!event) return null;
          return {
            eventID: trip.id,
            eventName: event.title,
            eventDateTime: `${trip.date}T${trip.time}:00`,
            serviceID: event.id,
            serviceName: event.title,
            eventFreeSeating: !event.hasSeating,
            eventNoSeats: !event.hasSeating,
            eventDuration: event.durationMinutes,
            availableSeats: trip.availableSeats,
            pierName: trip.pierStart,
            endPointName: trip.pierEnd,
          } as AstraEvent;
        })
        .filter(Boolean) as AstraEvent[];

      return { events: eventID ? events.filter((ev) => ev.eventID === eventID) : events };
    }
    case "getSeatsOnEvent": {
      const { eventID } = body ?? {};
      const trip = waterTrips.find((t) => t.id === eventID || t.eventId === eventID);
      const event = waterEvents.find((e) => e.id === (trip?.eventId ?? eventID));
      const seatMap = waterSeatMaps.find((s) => s.id === event?.seatMapId);
      const seats: AstraSeat[] = [];

      if (seatMap) {
        seatMap.areas.forEach((area) => {
          area.seats.forEach((seat: any) => {
            const status = lockState.has(seat.id) ? "Бронь" : seat.status === "taken" ? "Продано" : "Свободно";
            seats.push({
              seatID: seat.id,
              aliasSeat: seat.id,
              seatStatus: status,
              seatCategoryName: area.name,
              seatCategoryID: area.id,
              numberOfTicketsPerSeat: seat.ticketsPerSeat ?? 1,
              availableSeats: seat.ticketsPerSeat ?? 1,
            });
          });
        });
      }

      return { seats };
    }
    case "bookingSeat": {
      const { seatID, sessionID } = body ?? {};
      if (!seatID || !sessionID) {
        return { isSeatBooked: false, descriptionSeatBooked: "seatID and sessionID are required" };
      }

      if (lockState.has(seatID) && lockState.get(seatID)?.sessionId !== sessionID) {
        return { isSeatBooked: false, descriptionSeatBooked: "seat already locked" };
      }

      lockState.set(seatID, { sessionId: sessionID, lockedAt: Date.now() });
      return { isSeatBooked: true, descriptionSeatBooked: "ok" };
    }
    case "cancelBookSeat": {
      const { seatID, sessionID } = body ?? {};
      if (seatID) {
        const lock = lockState.get(seatID);
        if (lock && lock.sessionId === sessionID) {
          lockState.delete(seatID);
          return { isCanceledBookSeat: true, descriptionSeatBooked: "unlocked" };
        }
        return { isCanceledBookSeat: false, descriptionSeatBooked: "not locked by session" };
      }

      [...lockState.entries()].forEach(([key, value]) => {
        if (value.sessionId === sessionID) {
          lockState.delete(key);
        }
      });
      return { isCanceledBookSeat: true, descriptionSeatBooked: "cleared" };
    }
    case "registerOrder": {
      const { orderID, order } = body ?? {};
      const amount = Array.isArray(order)
        ? order.reduce((acc: number, item: any) => acc + Number(item.quantityOfTickets ?? 1) * 1000, 0)
        : 0;
      return {
        isOrderRegistred: true,
        descriptionRegistredOrder: "ok",
        orderAmount: amount,
        orderedSeats: (order ?? []).map((item: any) => ({
          seatID: item.seatID ?? "",
          ticketTypeID: item.ticketTypeID ?? "",
          priceTypeID: item.priceTypeID ?? "",
          seatCategoryID: item.seatCategoryID ?? "",
          quantityOfTickets: item.quantityOfTickets ?? 1,
          price: 1000,
        })),
        orderID,
      };
    }
    case "confirmPayment":
      return { orderPaymentConfirmed: true, descriptionOrderPayment: "paid" };
    case "getOrder":
      return { orderFound: true };
    case "getTicketType":
      return {
        ticketTypes: [
          { ticketTypeID: "adult", ticketTypeName: "Взрослый" },
          { ticketTypeID: "child", ticketTypeName: "Детский" },
          { ticketTypeID: "vip", ticketTypeName: "VIP" },
        ],
      } as AstraTicketTypeResponse;
    case "getSeatPrices": {
      const { ticketTypeID, seatCategoryID } = body ?? {};
      const priceBase = ticketTypeID === "vip" ? 2500 : ticketTypeID === "child" ? 900 : 1500;
      return {
        seatPrices: [
          {
            seatCategoryID: seatCategoryID || "deck_main",
            seatCategoryName: "Основной зал",
            ticketTypeID: ticketTypeID || "adult",
            priceTypeID: "base",
            priceTypeName: "Базовый тариф",
            priceValue: priceBase,
            hasMenu: false,
          },
        ],
      } as AstraSeatPriceResponse;
    }
    default:
      throw new Error(`Stub method ${method} not implemented`);
  }
}

export const astraClient = {
  getEvents(params: {
    dateFrom?: string;
    dateTo?: string;
    serviceID?: string;
    eventID?: string;
    email?: string;
  }) {
    return post<{ events: AstraEvent[] }>("getEvents", params);
  },

  getSeatsOnEvent(params: { eventID: string; seatCategoryID?: string; email?: string }) {
    return post<{ seats: AstraSeat[] }>("getSeatsOnEvent", params);
  },

  bookingSeat(params: { eventID: string; sessionID: string; seatID: string; email?: string }) {
    return post<{ isSeatBooked: boolean; descriptionSeatBooked: string }>("bookingSeat", params);
  },

  cancelBookSeat(params: { eventID: string; sessionID: string; seatID?: string; email?: string }) {
    return post<{ isCanceledBookSeat: boolean; descriptionSeatBooked: string }>("cancelBookSeat", params);
  },

  registerOrder(body: any) {
    return post<any>("registerOrder", body);
  },

  confirmPayment(body: any) {
    return post<any>("confirmPayment", body);
  },

  getOrder(body: any) {
    return post<any>("getOrder", body);
  },

  getTicketTypes(params: { eventID: string; email?: string }) {
    return post<AstraTicketTypeResponse>("getTicketType", params);
  },

  getSeatPrices(params: {
    eventID: string;
    ticketTypeID: string;
    seatCategoryID?: string;
    paymentTypeID?: string;
    resident?: boolean | string;
    email?: string;
  }) {
    return post<AstraSeatPriceResponse>("getSeatPrices", params);
  },
};
