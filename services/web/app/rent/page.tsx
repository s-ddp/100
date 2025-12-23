"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

function boatTypeLabel(t: string) {
  switch (t) {
    case "catamaran":
      return "Катер";
    case "motor-yacht":
      return "Моторная яхта";
    case "sail-yacht":
      return "Парусная яхта";
    case "jet-ski":
      return "Гидроцикл";
    default:
      return t;
  }
}

export default function RentPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [parameters, setParameters] = useState<RentParam[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);

  const [cityId, setCityId] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [maxCapacity, setMaxCapacity] = useState<number>(20);

  const [dyn, setDyn] = useState<Record<string, any>>({});

  async function load() {
    const res = await fetch("/api/rent/metadata", { cache: "no-store" });
    const data = await res.json();
    setCities(data.cities || []);
    setParameters((data.parameters || []).filter((p: RentParam) => p.active));
    setBoats((data.boats || []).filter((b: Boat) => b.active));
  }

  useEffect(() => {
    load();
  }, []);

  const filterableParams = useMemo(
    () => parameters.filter((p) => p.active && p.useInFilters),
    [parameters]
  );

  const computedCapacityMax = useMemo(() => {
    const capParamId = filterableParams.find((p) => p.type === "number" && p.id === "p_capacity")?.id;
    if (!capParamId) return 20;
    const values = boats.map((b) => Number(b.params?.[capParamId] ?? 0)).filter((n) => !Number.isNaN(n));
    return Math.max(20, ...values);
  }, [boats, filterableParams]);

  useEffect(() => {
    setMaxCapacity(computedCapacityMax);
  }, [computedCapacityMax]);

  const filtered = useMemo(() => {
    return boats.filter((b) => {
      if (cityId !== "all" && b.cityId !== cityId) return false;
      if (type !== "all" && b.type !== type) return false;
      if ((b.pricePerHour || 0) > maxPrice) return false;

      const cap = Number(b.params?.p_capacity ?? b.params?.["p_capacity"] ?? b.params?.["capacity"] ?? 0);
      if (cap && cap > maxCapacity) return false;

      for (const p of filterableParams) {
        const f = dyn[p.id];
        if (f == null || f === "" || (Array.isArray(f) && f.length === 0)) continue;

        const v = b.params?.[p.id];

        if (p.type === "number") {
          if (typeof f === "object" && f) {
            const min = f.min ?? null;
            const max = f.max ?? null;
            const num = Number(v);
            if (min != null && num < min) return false;
            if (max != null && num > max) return false;
          } else {
            const num = Number(v);
            if (num > Number(f)) return false;
          }
        } else if (p.type === "enum") {
          if (String(v) !== String(f)) return false;
        } else if (p.type === "boolean") {
          if (Boolean(v) !== Boolean(f)) return false;
        } else if (p.type === "multiselect") {
          const arr = Array.isArray(v) ? v : [];
          const need = Array.isArray(f) ? f : [];
          for (const x of need) {
            if (!arr.includes(x)) return false;
          }
        } else if (p.type === "text") {
          const s = String(f).toLowerCase();
          if (!String(v ?? "").toLowerCase().includes(s)) return false;
        }
      }

      return true;
    });
  }, [boats, cityId, type, maxPrice, maxCapacity, dyn, filterableParams]);

  function reset() {
    setCityId("all");
    setType("all");
    setMaxPrice(25000);
    setMaxCapacity(computedCapacityMax);
    setDyn({});
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px 80px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 34, margin: "0 0 8px" }}>Аренда судов</h1>
        <div style={{ opacity: 0.75 }}>Выберите катер, яхту или гидроцикл</div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 16,
          boxShadow: "0 6px 18px rgba(0,0,0,.06)",
          marginBottom: 22,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          alignItems: "end",
        }}
      >
        <label>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Город</div>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
          >
            <option value="all">Все</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Тип судна</div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
          >
            <option value="all">Все</option>
            <option value="catamaran">Катер</option>
            <option value="motor-yacht">Моторная яхта</option>
            <option value="sail-yacht">Парусная яхта</option>
            <option value="jet-ski">Гидроцикл</option>
          </select>
        </label>

        <label>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Макс. человек: {maxCapacity}</div>
          <input
            type="range"
            min={1}
            max={computedCapacityMax}
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>
            Цена до: {maxPrice.toLocaleString("ru-RU")} ₽
          </div>
          <input
            type="range"
            min={2000}
            max={25000}
            step={1000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        {filterableParams.map((p) => {
          if (!p.useInFilters) return null;

          if (p.type === "enum") {
            return (
              <label key={p.id}>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>{p.name}</div>
                <select
                  value={dyn[p.id] ?? ""}
                  onChange={(e) => setDyn((d) => ({ ...d, [p.id]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
                >
                  <option value="">Все</option>
                  {(p.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (p.type === "boolean") {
            return (
              <label key={p.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={Boolean(dyn[p.id])}
                  onChange={(e) => setDyn((d) => ({ ...d, [p.id]: e.target.checked }))}
                />
                <span style={{ opacity: 0.9 }}>{p.name}</span>
              </label>
            );
          }

          if (p.type === "multiselect") {
            const arr: string[] = Array.isArray(dyn[p.id]) ? dyn[p.id] : [];
            return (
              <div key={p.id}>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(p.options || []).map((opt) => {
                    const checked = arr.includes(opt);
                    return (
                      <label key={opt} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked ? [...arr, opt] : arr.filter((x) => x !== opt);
                            setDyn((d) => ({ ...d, [p.id]: next }));
                          }}
                        />
                        <span style={{ fontSize: 13 }}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (p.type === "text") {
            return (
              <label key={p.id}>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>{p.name}</div>
                <input
                  value={dyn[p.id] ?? ""}
                  onChange={(e) => setDyn((d) => ({ ...d, [p.id]: e.target.value }))}
                  placeholder="Поиск..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
              </label>
            );
          }

          if (p.type === "number") {
            return (
              <label key={p.id}>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>{p.name} (макс.)</div>
                <input
                  type="number"
                  value={dyn[p.id] ?? ""}
                  onChange={(e) => setDyn((d) => ({ ...d, [p.id]: e.target.value === "" ? "" : Number(e.target.value) }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
              </label>
            );
          }

          return null;
        })}

        <button
          onClick={reset}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Сбросить
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map((b) => (
          <Link
            key={b.id}
            href={`/rent/${b.id}`}
            style={{
              textDecoration: "none",
              color: "#111",
              background: "#fff",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 6px 18px rgba(0,0,0,.06)",
            }}
          >
            <div
              style={{
                height: 160,
                background: `url(${b.images?.[0] || ""}) center/cover no-repeat`,
                backgroundColor: "#eef2ff",
              }}
            />
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{b.name}</div>
              <div style={{ opacity: 0.7, fontSize: 13, marginBottom: 8 }}>
                {boatTypeLabel(b.type)} • {b.params?.p_capacity ? `${b.params.p_capacity} чел.` : ""}
              </div>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>
                {(b.pricePerHour || 0).toLocaleString("ru-RU")} ₽ / час
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  background: "#0b4bff",
                  color: "#fff",
                  borderRadius: 10,
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                Арендовать →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
