"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiPublicGetBoat } from "@/app/lib/api";

type Boat = any;

export default function RentBoatPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [boat, setBoat] = useState<Boat | null>(null);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiPublicGetBoat(id);
        setBoat(res.item);
        setActiveImg(res.item?.images?.[0]?.url ?? null);
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить судно");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const groupedParams = useMemo(() => {
    const list = (boat?.parameters || []) as any[];
    const map = new Map<string, any[]>();
    for (const p of list) {
      const group = p?.parameter?.group || "Параметры";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(p);
    }
    return Array.from(map.entries());
  }, [boat]);

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Загрузка…</p>
      </main>
    );
  }

  if (error || !boat) {
    return (
      <main style={{ padding: 24 }}>
        <p style={{ color: "crimson" }}>{error || "Судно не найдено"}</p>
        <Link href="/rent" style={{ textDecoration: "none" }}>← Назад к аренде</Link>
      </main>
    );
  }

  const images = boat.images || [];

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Link href="/rent" style={{ textDecoration: "none" }}>← Назад к аренде</Link>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, marginTop: 16 }}>
        {/* Gallery */}
        <section>
          <div style={{ borderRadius: 18, overflow: "hidden", background: "#f2f2f2", height: 420 }}>
            {activeImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeImg} alt={boat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : null}
          </div>

          {images.length > 1 && (
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {images.map((img: any) => (
                <button
                  key={img.id || img.url}
                  onClick={() => setActiveImg(img.url)}
                  style={{
                    width: 90,
                    height: 64,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: activeImg === img.url ? "2px solid black" : "1px solid #ddd",
                    padding: 0,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                  aria-label="Выбрать фото"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <aside style={{ border: "1px solid #e6e6e6", borderRadius: 18, padding: 16, height: "fit-content" }}>
          <h1 style={{ margin: 0 }}>{boat.name}</h1>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            {boat.type?.name ? <span>{boat.type.name}</span> : null}
            {boat.location?.name ? <span> • {boat.location.name}</span> : null}
          </div>

          {boat.description ? (
            <p style={{ marginTop: 12, lineHeight: 1.5 }}>{boat.description}</p>
          ) : (
            <p style={{ marginTop: 12, opacity: 0.7 }}>Описание пока не заполнено.</p>
          )}

          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <button
              disabled
              title="Дальше подключим календарь + бронирование"
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #ddd",
                background: "black",
                color: "white",
                fontWeight: 800,
                cursor: "not-allowed",
              }}
            >
              Выбрать дату и арендовать (следующий шаг)
            </button>

            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Сейчас делаем карточку. Дальше подключим календарь, доступность и оплату.
            </div>
          </div>
        </aside>
      </div>

      {/* Parameters */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Характеристики</h2>

        {groupedParams.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Параметры не заполнены.</p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {groupedParams.map(([group, items]) => (
              <div key={group} style={{ border: "1px solid #e6e6e6", borderRadius: 18, padding: 16 }}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>{group}</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {items.map((p: any) => {
                    const name = p?.parameter?.name ?? "Параметр";
                    const unit = p?.parameter?.unit ? ` ${p.parameter.unit}` : "";
                    const value =
                      p.valueText ??
                      (typeof p.valueNumber === "number" ? `${p.valueNumber}${unit}` : null) ??
                      (typeof p.valueBool === "boolean" ? (p.valueBool ? "Да" : "Нет") : null) ??
                      "";

                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 14,
                          background: "#fafafa",
                        }}
                      >
                        <span style={{ opacity: 0.8 }}>{name}</span>
                        <span style={{ fontWeight: 800 }}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
