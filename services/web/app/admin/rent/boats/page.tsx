"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Boat = {
  id: string;
  name: string;
  cityId: string;
  type: string;
  pricePerHour: number;
  active: boolean;
};

export default function AdminRentBoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch("/api/admin/rent/boats", { cache: "no-store" });
    const data = await res.json();
    setBoats(data.boats || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return boats;
    return boats.filter((b) => b.name.toLowerCase().includes(s) || b.id.toLowerCase().includes(s));
  }, [boats, q]);

  async function createBoat() {
    const name = prompt("Название судна");
    if (!name) return;

    await fetch("/api/admin/rent/boats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        cityId: "spb",
        type: "catamaran",
        pricePerHour: 0,
        images: [],
        params: {},
        active: true,
      }),
    });

    await load();
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Судна для аренды</h1>
          <div style={{ opacity: 0.7, marginTop: 6 }}>Список судов и переход в карточку для редактирования.</div>
        </div>

        <button
          onClick={createBoat}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#2b5cff",
            border: "1px solid rgba(255,255,255,.08)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Добавить судно
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию или ID..."
          style={{
            width: 420,
            maxWidth: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.10)",
            background: "rgba(255,255,255,.04)",
            color: "#fff",
            outline: "none",
          }}
        />
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,.10)", borderRadius: 14, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 120px 140px",
            padding: "12px 14px",
            background: "rgba(255,255,255,.05)",
            fontWeight: 700,
            fontSize: 13,
            opacity: 0.9,
          }}
        >
          <div>Судно</div>
          <div>Тип</div>
          <div>Город</div>
          <div>Цена/час</div>
          <div>Статус</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 16, opacity: 0.7 }}>Пока нет судов. Нажми “Добавить судно”.</div>
        ) : (
          filtered.map((b) => (
            <Link
              key={b.id}
              href={`/admin/rent/boats/${b.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1fr 120px 140px",
                padding: "12px 14px",
                textDecoration: "none",
                color: "#fff",
                borderTop: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div style={{ fontWeight: 700 }}>{b.name}</div>
              <div style={{ opacity: 0.8 }}>{b.type}</div>
              <div style={{ opacity: 0.8 }}>{b.cityId}</div>
              <div style={{ opacity: 0.9 }}>{(b.pricePerHour || 0).toLocaleString("ru-RU")} ₽</div>
              <div style={{ opacity: 0.9 }}>{b.active ? "Активно" : "Выключено"}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
