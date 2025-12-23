import { Router } from "../vendor/express.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const publicRentRouter = Router();

/**
 * Public: list of ACTIVE boats
 * GET /rent/boats?typeId=&locationId=
 */
publicRentRouter.get("/boats", async (req, res) => {
  const { typeId, locationId } = req.query;

  const where: any = { isActive: true };
  if (typeId) where.typeId = String(typeId);
  if (locationId) where.locationId = String(locationId);

  const items = await prisma.boat.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    include: {
      type: true,
      location: true,
      images: { orderBy: [{ sortOrder: "asc" }] },
      parameters: { include: { parameter: true } },
    },
  });

  res.json({ items });
});

/**
 * Public: ACTIVE boat by id
 * GET /rent/boats/:id
 */
publicRentRouter.get("/boats/:id", async (req, res) => {
  const id = req.params.id;

  const item = await prisma.boat.findFirst({
    where: { id, isActive: true },
    include: {
      type: true,
      location: true,
      images: { orderBy: [{ sortOrder: "asc" }] },
      parameters: { include: { parameter: true } },
    },
  });

  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});
