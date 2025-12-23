"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  apiAdminGetBoats,
  apiGetBoatTypes,
  apiGetLocations,
  apiAdminToggleBoatActive,
} from "@/app/lib/api";

type BoatType = { id: string; name: string };
type Location = { id: string; name: string; city?: string | null };
type Boat = any;

export default function AdminRentBoatsPage() {
  const [types, setTypes] = useState<BoatType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [tabTypeId, setTabTypeId] = useState<string>("ALL");
  const [filterLocationId, setFilterLocationId] = useState<string>("ALL");
  const [filterActive, setFilterActive] = useState<string>("ALL"); // ALL|true|false
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return boats.filter((b) => {
      if (tabTypeId !== "ALL" && b.typeId !== tabTypeId) return false;
      if (filterLocationId !== "ALL" && b.locationId !== filterLocationId) return false;
      if (filterActive !== "ALL" && String(b.isActive) !== filterActive) return false;
      if (qq) {
        const hay = `${b.name ?? ""} ${(b.type?.name ?? "")} ${(b.location?.name ?? "")}`.toLowerCase();
        if (!hay.includes(qq)) return false;
      }
      return true;
    });
  }, [boats, tabTypeId, filterLocationId, filterActive, q]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [t, l, b] = await Promise.all([apiGetBoatTypes(), apiGetLocations(), apiAdminGetBoats()]);
      setTypes(t.items);
      setLocations(l.items);
      setBoats(b.items);
    } catch (e: any) {
      setError(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function toggleActive(id: string, next: boolean) {
    try {
      await apiAdminToggleBoatActive(id, next);
      await loadAll();
    } catch (e: any) {
      alert(e?.message || "Не удалось изменить активность");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Судна для аренды</h1>
        <Link
          href="/admin/rent/boats/new"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "black",
            color: "white",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + Завести судно
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => setTabTypeId("ALL")}
          style={tabBtn(tabTypeId === "ALL")}
        >
          Все суда
        </button>
        {types.map((t) => (
          <button key={t.id} onClick={() => setTabTypeId(t.id)} style={tabBtn(tabTypeId === t.id)}>
            {t.name}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 220px 220px",
          gap: 12,
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию / локации..."
          style={inputStyle()}
        />

        <select value={filterLocationId} onChange={(e) => setFilterLocationId(e.target.value)} style={inputStyle()}>
          <option value="ALL">Все локации</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} style={inputStyle()}>
          <option value="ALL">Активность: все</option>
          <option value="true">Только активные</option>
          <option value="false">Только неактивные</option>
        </select>
      </div>

      {loading && <p style={{ marginTop: 16 }}>Загрузка…</p>}
      {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {filtered.map((b) => (
            <div
              key={b.id}
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: 14,
                padding: 14,
                display: "grid",
                gridTemplateColumns: "140px 1fr 220px",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ width: 140, height: 90, borderRadius: 12, overflow: "hidden", background: "#f2f2f2" }}>
                {b.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.images[0].url} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>

              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <Link href={`/admin/rent/boats/${b.id}`} style={{ fontWeight: 800, textDecoration: "none" }}>
                    {b.name}
                  </Link>
                  <span style={{ opacity: 0.7 }}>{b.type?.name}</span>
                  <span style={{ opacity: 0.7 }}>•</span>
                  <span style={{ opacity: 0.7 }}>{b.location?.name}</span>
                </div>

                {/* Parameters preview */}
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(b.parameters || []).slice(0, 6).map((p: any) => (
                    <span
                      key={p.id}
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: "#f5f5f5",
                      }}
                    >
                      {p.parameter?.name}:{" "}
                      {p.valueText ?? p.valueNumber ?? (typeof p.valueBool === "boolean" ? (p.valueBool ? "да" : "нет") : "")}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={Boolean(b.isActive)}
                    onChange={(e) => toggleActive(b.id, e.target.checked)}
                  />
                  Активно
                </label>
                <Link href={`/admin/rent/boats/${b.id}`} style={linkBtn()}>
                  Редактировать
                </Link>
              </div>
            </div>
          ))}

          {!filtered.length && <p>Судов не найдено.</p>}
        </div>
      )}
    </main>
  );
}

function tabBtn(active: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: active ? "black" : "white",
    color: active ? "white" : "black",
    cursor: "pointer",
    fontWeight: 700,
  };
}

function inputStyle(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    outline: "none",
  };
}

function linkBtn(): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    textDecoration: "none",
    color: "black",
    fontWeight: 700,
  };
}
