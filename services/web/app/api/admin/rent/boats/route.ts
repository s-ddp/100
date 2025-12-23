import { NextResponse } from "next/server";
import { readJson, writeJson, uid } from "@/lib/jsonDb";

type Boat = {
  id: string;
  name: string;
  cityId: string;
  type: string;
  pricePerHour: number;
  images: string[];
  params: Record<string, any>;
  active: boolean;
};

const FILE = "rent-boats.json";

export async function GET() {
  const boats = readJson<Boat[]>(FILE, []);
  return NextResponse.json({ boats });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Boat>;
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

  const boats = readJson<Boat[]>(FILE, []);

  const boat: Boat = {
    id: body.id?.trim() || uid("boat"),
    name,
    cityId: body.cityId || "spb",
    type: body.type || "catamaran",
    pricePerHour: Number(body.pricePerHour ?? 0),
    images: Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [],
    params: body.params && typeof body.params === "object" ? (body.params as Record<string, any>) : {},
    active: body.active ?? true,
  };

  const idx = boats.findIndex((b) => b.id === boat.id);
  if (idx >= 0) boats[idx] = boat;
  else boats.unshift(boat);

  writeJson(FILE, boats);
  return NextResponse.json({ boat, boats });
}
