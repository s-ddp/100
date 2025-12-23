import { NextResponse } from "next/server";
import { readJson, writeJson, uid } from "@/lib/jsonDb";

export type ParamType = "text" | "number" | "enum" | "multiselect" | "boolean";

export type RentParam = {
  id: string;
  name: string;
  type: ParamType;
  useInFilters: boolean;
  active: boolean;
  options: string[];
};

const FILE = "rent-parameters.json";

export async function GET() {
  const parameters = readJson<RentParam[]>(FILE, []);
  return NextResponse.json({ parameters });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<RentParam>;
  const name = body.name?.trim();
  const type = body.type;

  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!type) return NextResponse.json({ error: "type_required" }, { status: 400 });

  const parameters = readJson<RentParam[]>(FILE, []);

  const param: RentParam = {
    id: body.id?.trim() || uid("p"),
    name,
    type,
    useInFilters: body.useInFilters ?? false,
    active: body.active ?? true,
    options: Array.isArray(body.options) ? body.options.filter(Boolean).map(String) : [],
  };

  if (param.type !== "enum" && param.type !== "multiselect") {
    param.options = [];
  }

  const idx = parameters.findIndex((p) => p.id === param.id);
  if (idx >= 0) parameters[idx] = param;
  else parameters.unshift(param);

  writeJson(FILE, parameters);
  return NextResponse.json({ param, parameters });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const parameters = readJson<RentParam[]>(FILE, []);
  const next = parameters.filter((p) => p.id !== id);
  writeJson(FILE, next);
  return NextResponse.json({ ok: true, parameters: next });
}
