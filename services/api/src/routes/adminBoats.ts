import { PrismaClient } from "@prisma/client";
import { Router } from "../vendor/express.js";

const prisma = new PrismaClient();
export const adminBoatsRouter = Router();

// List all boats (with optional filters)
adminBoatsRouter.get("/", async (req, res) => {
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
      parameters: { include: { parameter: true } },
    },
  });

  res.json({ items });
});

// Create boat
adminBoatsRouter.post("/", async (req, res) => {
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

  const item = await prisma.boat.create({
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
      images: { orderBy: [{ sortOrder: "asc" }] },
      parameters: { include: { parameter: true } },
    },
  });

  res.json({ item });
});

// Get boat by id
adminBoatsRouter.get("/:id", async (req, res) => {
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

// Update basic boat fields (does not replace images/parameters here)
adminBoatsRouter.put("/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body as {
    name?: string;
    description?: string;
    typeId?: string;
    locationId?: string;
    isActive?: boolean;
  };

  const item = await prisma.boat.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description ?? undefined,
      typeId: body.typeId,
      locationId: body.locationId,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    },
    include: {
      type: true,
      location: true,
      images: { orderBy: [{ sortOrder: "asc" }] },
      parameters: { include: { parameter: true } },
    },
  });

  res.json({ item });
});

// Toggle active
adminBoatsRouter.patch("/:id/active", async (req, res) => {
  const id = req.params.id;
  const { isActive } = req.body as { isActive: boolean };
  const item = await prisma.boat.update({ where: { id }, data: { isActive: Boolean(isActive) } });
  res.json({ item });
});

// Replace parameters
adminBoatsRouter.post("/:id/parameters", async (req, res) => {
  const id = req.params.id;
  const { items } = req.body as { items: { parameterId: string; valueText?: string; valueNumber?: number; valueBool?: boolean }[] };

  await prisma.boatParameter.deleteMany({ where: { boatId: id } });
  if (items?.length) {
    await prisma.boatParameter.createMany({
      data: items.map((p) => ({
        boatId: id,
        parameterId: p.parameterId,
        valueText: p.valueText ?? null,
        valueNumber: typeof p.valueNumber === "number" ? p.valueNumber : null,
        valueBool: typeof p.valueBool === "boolean" ? p.valueBool : null,
      })),
    });
  }

  const item = await prisma.boat.findUnique({
    where: { id },
    include: {
      type: true,
      location: true,
      images: { orderBy: [{ sortOrder: "asc" }] },
      parameters: { include: { parameter: true } },
    },
  });

  res.json({ item });
});

// Add image
adminBoatsRouter.post("/:id/images", async (req, res) => {
  const boatId = req.params.id;
  const { url, sortOrder } = req.body as { url: string; sortOrder?: number };
  if (!url) return res.status(400).json({ error: "url is required" });

  const created = await prisma.boatImage.create({
    data: { boatId, url, sortOrder: sortOrder ?? 0 },
  });

  res.json({ item: created });
});

// Delete image
adminBoatsRouter.delete("/images/:imageId", async (req, res) => {
  const imageId = req.params.imageId;
  await prisma.boatImage.delete({ where: { id: imageId } });
  res.json({ ok: true });
});
