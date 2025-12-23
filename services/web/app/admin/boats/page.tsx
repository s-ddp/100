"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  apiAdminGetBoats,
  apiAdminToggleBoatActive,
  apiGetBoatTypes,
  apiGetLocations,
} from "@/app/lib/api";

export default function AdminBoatsPage() {
  const [boats, setBoats] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [b, t, l] = await Promise.all([
      apiAdminGetBoats(),
      apiGetBoatTypes(),
      apiGetLocations(),
    ]);
    setBoats(b.items);
    setTypes(t.items);
    setLocations(l.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(id: string, next: boolean) {
    await apiAdminToggleBoatActive(id, next);
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Суда</h1>
        <Link href="/admin/boats/new" style={btnPrimary}>
          ➕ Добавить судно
        </Link>
      </div>

      {loading && <p>Загрузка…</p>}

      {!loading && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {boats.map((b) => (
            <div key={b.id} style={card}>
              <div>
                <b>{b.name}</b>{" "}
                <span style={{ opacity: 0.6 }}>
                  ({b.type?.name} · {b.location?.name})
                </span>
                <div style={{ fontSize: 12, opacity: 0.6 }}>ID: {b.id}</div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={b.isActive}
                    onChange={(e) => toggleActive(b.id, e.target.checked)}
                  />{" "}
                  Активно для аренды
                </label>
                <Link href={`/admin/boats/${b.id}`} style={btn}>
                  Редактировать
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #2a2f3a",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const btn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #2a2f3a",
  textDecoration: "none",
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "#0b5cff",
  color: "#fff",
};
