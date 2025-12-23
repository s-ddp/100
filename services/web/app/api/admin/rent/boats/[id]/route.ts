import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/jsonDb";

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

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const boats = readJson<Boat[]>(FILE, []);
  const boat = boats.find((b) => b.id === ctx.params.id);
  if (!boat) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ boat });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const boats = readJson<Boat[]>(FILE, []);
  const next = boats.filter((b) => b.id !== ctx.params.id);
  writeJson(FILE, next);
  return NextResponse.json({ ok: true });
}
