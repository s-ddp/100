import { NextResponse } from "next/server";
import { readJson } from "@/lib/jsonDb";

type City = { id: string; name: string; active: boolean };
type RentParam = {
  id: string;
  name: string;
  type: "text" | "number" | "enum" | "multiselect" | "boolean";
  useInFilters: boolean;
  active: boolean;
  options: string[];
};
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

export async function GET() {
  const cities = readJson<City[]>("cities.json", []).filter((c) => c.active);
  const parameters = readJson<RentParam[]>("rent-parameters.json", []).filter((p) => p.active);
  const boats = readJson<Boat[]>("rent-boats.json", []).filter((b) => b.active);

  return NextResponse.json({
    cities,
    parameters,
    boats,
  });
}
