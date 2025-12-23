import { Router } from "../vendor/express.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const adminRentRouter = Router();

// --- Dictionaries ---
adminRentRouter.get("/dictionaries/boat-types", async (_req, res) => {
  const items = await prisma.boatType.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  res.json({ items });
});

adminRentRouter.get("/dictionaries/locations", async (_req, res) => {
  const items = await prisma.location.findMany({ orderBy: [{ name: "asc" }] });
  res.json({ items });
});

adminRentRouter.get("/dictionaries/parameters", async (_req, res) => {
  const items = await prisma.parameter.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  res.json({ items });
});

// --- Boats list (admin) ---
adminRentRouter.get("/boats", async (req, res) => {
  const { typeId, locationId, isActive } = req.query;

  const where: any = {};
  if (typeId) where.typeId = String(typeId);
  if (locationId) where.locationId = String(locationId);
  if (isActive === "true") where.isActive = true;
  if (isActive === "false") where.isActive = false;

  const items = await prisma.boat.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    include: {
      type: true,
      location: true,
      images: { orderBy: [{ sortOrder: "asc" }] },
      parameters: {
        include: { parameter: true },
      },
    },
  });

  res.json({ items });
});

// --- Create boat ---
adminRentRouter.post("/boats", async (req, res) => {
  const body = req.body as {
    name: string;
    description?: string;
    typeId: string;
    locationId: string;
    isActive?: boolean;
    images?: { url: string; sortOrder?: number }[];
    parameters?: { parameterId: string; valueText?: string; valueNumber?: number; valueBool?: boolean }[];
  };

  if (!body?.name || !body?.typeId || !body?.locationId) {
    return res.status(400).json({ error: "name, typeId, locationId are required" });
  }

  const boat = await prisma.boat.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      typeId: body.typeId,
      locationId: body.locationId,
      isActive: Boolean(body.isActive),

      images: body.images?.length
        ? { create: body.images.map((i) => ({ url: i.url, sortOrder: i.sortOrder ?? 0 })) }
        : undefined,

      parameters: body.parameters?.length
        ? {
            create: body.parameters.map((p) => ({
              parameterId: p.parameterId,
              valueText: p.valueText ?? null,
              valueNumber: typeof p.valueNumber === "number" ? p.valueNumber : null,
              valueBool: typeof p.valueBool === "boolean" ? p.valueBool : null,
            })),
          }
        : undefined,
    },
    include: {
      type: true,
      location: true,
      images: true,
      parameters: { include: { parameter: true } },
    },
  });

  res.json({ item: boat });
});

// --- Get boat by id ---
adminRentRouter.get("/boats/:id", async (req, res) => {
  const id = req.params.id;
  const item = await prisma.boat.findUnique({
    where: { id },
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

// --- Update boat (replace images/params) ---
adminRentRouter.put("/boats/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body as {
    name?: string;
    description?: string;
    typeId?: string;
    locationId?: string;
    isActive?: boolean;
    images?: { url: string; sortOrder?: number }[];
    parameters?: { parameterId: string; valueText?: string; valueNumber?: number; valueBool?: boolean }[];
  };

  // 1) update base
  const updated = await prisma.boat.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description ?? undefined,
      typeId: body.typeId,
      locationId: body.locationId,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    },
  });

  // 2) replace images if provided
  if (body.images) {
    await prisma.boatImage.deleteMany({ where: { boatId: id } });
    if (body.images.length) {
      await prisma.boatImage.createMany({
        data: body.images.map((i) => ({ boatId: id, url: i.url, sortOrder: i.sortOrder ?? 0 })),
      });
    }
  }

  // 3) replace parameters if provided
  if (body.parameters) {
    await prisma.boatParameter.deleteMany({ where: { boatId: id } });
    if (body.parameters.length) {
      await prisma.boatParameter.createMany({
        data: body.parameters.map((p) => ({
          boatId: id,
          parameterId: p.parameterId,
          valueText: p.valueText ?? null,
          valueNumber: typeof p.valueNumber === "number" ? p.valueNumber : null,
          valueBool: typeof p.valueBool === "boolean" ? p.valueBool : null,
        })),
      });
    }
  }

  const item = await prisma.boat.findUnique({
    where: { id: updated.id },
    include: {
      type: true,
      location: true,
      images: { orderBy: [{ sortOrder: "asc" }] },
      parameters: { include: { parameter: true } },
    },
  });

  res.json({ item });
});

// --- Toggle active ---
adminRentRouter.patch("/boats/:id/active", async (req, res) => {
  const id = req.params.id;
  const { isActive } = req.body as { isActive: boolean };
  const item = await prisma.boat.update({ where: { id }, data: { isActive: Boolean(isActive) } });
  res.json({ item });
});
