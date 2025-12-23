"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiPublicGetBoat } from "@/app/lib/api";

type Boat = any;

export default function RentBoatPublicCard({ params }: { params: { id: string } }) {
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiPublicGetBoat(params.id);
        setBoat(res.item);
      } catch (e: any) {
        setError(e?.message || "Судно не найдено");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <div style={{ padding: 28 }}>Загрузка…</div>;
  if (error || !boat) return <div style={{ padding: 28 }}>Судно не найдено</div>;

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
            background: `url(${boat.images?.[0]?.url || ""}) center/cover no-repeat`,
            backgroundColor: "#eef2ff",
          }}
        />
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
            {boat.type?.name}
            {boat.location?.name ? ` • ${boat.location.name}` : ""}
          </div>

          <div style={{ opacity: 0.8, marginBottom: 10 }}>Параметры:</div>

          <div style={{ display: "grid", gap: 8 }}>
            {(boat.parameters || []).map((p: any) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ opacity: 0.7 }}>{p.parameter?.name}</div>
                <div style={{ fontWeight: 700 }}>
                  {p.valueText ?? p.valueNumber ?? (typeof p.valueBool === "boolean" ? (p.valueBool ? "Да" : "Нет") : "")}
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
