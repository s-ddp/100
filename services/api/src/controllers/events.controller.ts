import { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { getAvailableSeatsForEvent } from "../services/seat.service.js";

export async function getTicketTypes(req: Request, res: Response) {
  const { id: eventId } = req.params;
  const ticketTypes = await prisma.ticketType.findMany({
    where: { eventId, isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      currency: true,
      saleStarts: true,
      saleEnds: true,
    },
    orderBy: [{ name: "asc" }],
  });

  res.json({ eventId, items: ticketTypes });
}

export async function getPrices(req: Request, res: Response) {
  const { id: eventId } = req.params;

  const prices = await prisma.ticketPrice.findMany({
    where: { eventId, isActive: true },
    select: {
      id: true,
      amount: true,
      feeAmount: true,
      currency: true,
      zone: true,
      ticketType: { select: { id: true, code: true, name: true } },
      seatCategory: { select: { id: true, code: true, name: true } },
    },
  });

  // Группируем по типу билета
  const byType: Record<
    string,
    {
      ticketTypeId: string;
      ticketTypeCode: string;
      ticketTypeName: string;
      rows: Array<{
        seatCategoryId: string | null;
        seatCategoryCode: string | null;
        seatCategoryName: string | null;
        zone: string | null;
        amount: string;
        feeAmount: string | null;
        currency: string;
      }>;
    }
  > = {};

  for (const p of prices) {
    const key = p.ticketType.id;
    byType[key] ??= {
      ticketTypeId: p.ticketType.id,
      ticketTypeCode: p.ticketType.code,
      ticketTypeName: p.ticketType.name,
      rows: [],
    };
    byType[key].rows.push({
      seatCategoryId: p.seatCategory?.id ?? null,
      seatCategoryCode: p.seatCategory?.code ?? null,
      seatCategoryName: p.seatCategory?.name ?? null,
      zone: p.zone ?? null,
      amount: p.amount.toString(),
      feeAmount: p.feeAmount ? p.feeAmount.toString() : null,
      currency: p.currency,
    });
  }

  res.json({
    eventId,
    ticketTypes: Object.values(byType),
  });
}

export async function getAvailableSeats(req: Request, res: Response) {
  const { id: eventId } = req.params;
  const seats = await getAvailableSeatsForEvent(eventId);
  res.json({
    eventId,
    total: seats.length,
    available: seats.filter((s) => s.status === "AVAILABLE").length,
    items: seats,
  });
}
