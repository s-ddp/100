"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function RentBoatPublicCard({ params }: { params: { id: string } }) {
  const [boat, setBoat] = useState<Boat | null>(null);

  useEffect(() => {
    (async () => {
      const meta = await fetch("/api/rent/metadata", { cache: "no-store" }).then((r) => r.json());
      const found = (meta.boats || []).find((b: Boat) => b.id === params.id);
      setBoat(found || null);
    })();
  }, [params.id]);

  if (!boat) return <div style={{ padding: 28 }}>Судно не найдено</div>;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px 80px" }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/rent" style={{ textDecoration: "none", color: "#0b4bff" }}>
          ← Назад к аренде
        </Link>
      </div>

      <h1 style={{ margin: "0 0 12px" }}>{boat.name}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div
          style={{
            height: 420,
            borderRadius: 14,
            background: `url(${boat.images?.[0] || ""}) center/cover no-repeat`,
            backgroundColor: "#eef2ff",
          }}
        />
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
            {(boat.pricePerHour || 0).toLocaleString("ru-RU")} ₽ / час
          </div>

          <div style={{ opacity: 0.8, marginBottom: 10 }}>Параметры:</div>

          <div style={{ display: "grid", gap: 8 }}>
            {Object.entries(boat.params || {}).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ opacity: 0.7 }}>{k}</div>
                <div style={{ fontWeight: 700 }}>
                  {Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? (v ? "Да" : "Нет") : String(v)}
                </div>
              </div>
            ))}
          </div>

          <button
            style={{
              width: "100%",
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              background: "#0b4bff",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
            onClick={() => alert("Заявка: дальше подключим форму как в дизайне")}
          >
            Оставить заявку →
          </button>
        </div>
      </div>
    </main>
  );
}
