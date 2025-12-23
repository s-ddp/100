import { NextResponse } from "next/server";
import { readJson, writeJson, uid } from "@/lib/jsonDb";

type City = { id: string; name: string; active: boolean };

const FILE = "cities.json";

export async function GET() {
  const cities = readJson<City[]>(FILE, []);
  return NextResponse.json({ cities });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<City>;
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  const cities = readJson<City[]>(FILE, []);
  const city: City = {
    id: body.id?.trim() || uid("city"),
    name: body.name.trim(),
    active: body.active ?? true,
  };

  const idx = cities.findIndex((c) => c.id === city.id);
  if (idx >= 0) cities[idx] = city;
  else cities.unshift(city);

  writeJson(FILE, cities);
  return NextResponse.json({ city, cities });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const cities = readJson<City[]>(FILE, []);
  const next = cities.filter((c) => c.id !== id);
  writeJson(FILE, next);
  return NextResponse.json({ ok: true, cities: next });
}
