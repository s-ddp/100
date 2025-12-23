"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGetBoatTypes, apiPublicGetBoats } from "@/app/lib/api";

type BoatType = {
  id: string;
  name: string;
};

type Boat = {
  id: string;
  name: string;
  isActive: boolean;
  typeId: string;
  type?: BoatType;
  location?: { name: string };
  images?: { url: string }[];
  parameters?: any[];
};

export default function RentPage() {
  const [types, setTypes] = useState<BoatType[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [tabTypeId, setTabTypeId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [typesRes, boatsRes] = await Promise.all([
          apiGetBoatTypes(),
          apiPublicGetBoats(),
        ]);
        setTypes(typesRes.items);
        setBoats(boatsRes.items);
      } catch (e: any) {
        setError(e?.message || "Ошибка загрузки судов");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleBoats = useMemo(() => {
    if (tabTypeId === "ALL") return boats;
    return boats.filter((b) => b.typeId === tabTypeId);
  }, [boats, tabTypeId]);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Аренда судов</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <TabButton active={tabTypeId === "ALL"} onClick={() => setTabTypeId("ALL")}>
          Все суда
        </TabButton>

        {types.map((t) => (
          <TabButton
            key={t.id}
            active={tabTypeId === t.id}
            onClick={() => setTabTypeId(t.id)}
          >
            {t.name}
          </TabButton>
        ))}
      </div>

      {loading && <p>Загрузка…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {visibleBoats.map((b) => (
            <Link
              key={b.id}
              href={`/rent/${b.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                border: "1px solid #e5e5e5",
                borderRadius: 16,
                overflow: "hidden",
                background: "white",
              }}
            >
              <div style={{ height: 180, background: "#f2f2f2" }}>
                {b.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.images[0].url}
                    alt={b.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>
                  {b.type?.name}
                  {b.location?.name ? ` • ${b.location.name}` : ""}
                </div>

                {/* параметры — превью */}
                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(b.parameters || []).slice(0, 4).map((p: any) => (
                    <span
                      key={p.id}
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: "#f5f5f5",
                      }}
                    >
                      {p.parameter?.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}

          {!visibleBoats.length && <p>Нет доступных судов.</p>}
        </div>
      )}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: active ? "black" : "white",
        color: active ? "white" : "black",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
