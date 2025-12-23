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

function typeLabel(t: RentParam["type"]) {
  switch (t) {
    case "text":
      return "Текст";
    case "number":
      return "Число";
    case "enum":
      return "Список (один вариант)";
    case "multiselect":
      return "Список (несколько вариантов)";
    case "boolean":
      return "Да / Нет";
  }
}

export default function AdminBoatCardPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [boat, setBoat] = useState<Boat | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [rentParams, setRentParams] = useState<RentParam[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [b, meta] = await Promise.all([
      fetch(`/api/admin/rent/boats/${id}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/rent/metadata`, { cache: "no-store" }).then((r) => r.json()),
    ]);

    if (b?.boat) setBoat(b.boat);
    setCities(meta?.cities || []);
    setRentParams((meta?.parameters || []).filter((p: RentParam) => p.active));
  }

  useEffect(() => {
    load();
  }, [id]);

  const activeParams = useMemo(() => rentParams.filter((p) => p.active), [rentParams]);

  function setField<K extends keyof Boat>(key: K, value: Boat[K]) {
    if (!boat) return;
    setBoat({ ...boat, [key]: value });
  }

  function setParamValue(paramId: string, value: any) {
    if (!boat) return;
    setBoat({ ...boat, params: { ...(boat.params || {}), [paramId]: value } });
  }

  async function save() {
    if (!boat) return;
    setSaving(true);
    try {
      await fetch("/api/admin/rent/boats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(boat),
      });
      alert("Сохранено");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Удалить судно?")) return;
    await fetch(`/api/admin/rent/boats/${id}`, { method: "DELETE" });
    window.location.href = "/admin/rent/boats";
  }

  if (!boat) {
    return <div style={{ padding: 28, opacity: 0.8 }}>Загрузка карточки судна…</div>;
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
        <div>
          <div style={{ opacity: 0.7, marginBottom: 6 }}>
            <Link href="/admin/rent/boats" style={{ color: "#9fb3ff", textDecoration: "none" }}>
              ← Судна
            </Link>
          </div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Судно</h1>
          <div style={{ opacity: 0.7, marginTop: 6 }}>Редактирование карточки + динамические параметры.</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={remove}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "transparent",
              border: "1px solid rgba(255,255,255,.16)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Удалить
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#2b5cff",
              border: "1px solid rgba(255,255,255,.08)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Основные поля */}
        <div style={{ border: "1px solid rgba(255,255,255,.10)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Основное</div>

          <label style={{ display: "block", marginBottom: 10 }}>
            <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Название</div>
            <input
              value={boat.name}
              onChange={(e) => setField("name", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,255,255,.04)",
                color: "#fff",
                outline: "none",
              }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "block" }}>
              <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Город</div>
              <select
                value={boat.cityId}
                onChange={(e) => setField("cityId", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,.10)",
                  background: "rgba(255,255,255,.04)",
                  color: "#fff",
                  outline: "none",
                }}
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block" }}>
              <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Тип судна</div>
              <select
                value={boat.type}
                onChange={(e) => setField("type", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,.10)",
                  background: "rgba(255,255,255,.04)",
                  color: "#fff",
                  outline: "none",
                }}
              >
                <option value="catamaran">Катер</option>
                <option value="motor-yacht">Моторная яхта</option>
                <option value="sail-yacht">Парусная яхта</option>
                <option value="jet-ski">Гидроцикл</option>
              </select>
            </label>

            <label style={{ display: "block" }}>
              <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Цена за час (₽)</div>
              <input
                type="number"
                value={boat.pricePerHour}
                onChange={(e) => setField("pricePerHour", Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,.10)",
                  background: "rgba(255,255,255,.04)",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
              <input
                type="checkbox"
                checked={boat.active}
                onChange={(e) => setField("active", e.target.checked)}
              />
              <span style={{ opacity: 0.85 }}>Активно</span>
            </label>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Фото (URL, по одному на строку)</div>
            <textarea
              value={(boat.images || []).join("\n")}
              onChange={(e) => setField("images", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
              style={{
                width: "100%",
                minHeight: 120,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,255,255,.04)",
                color: "#fff",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Динамические параметры */}
        <div style={{ border: "1px solid rgba(255,255,255,.10)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Параметры (из /admin/rent/parameters)</div>

          {activeParams.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Нет активных параметров. Создай их в “Параметры судов”.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {activeParams.map((p) => {
                const v = boat.params?.[p.id];

                if (p.type === "text") {
                  return (
                    <label key={p.id}>
                      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>
                        {p.name} <span style={{ opacity: 0.6 }}>({typeLabel(p.type)})</span>
                      </div>
                      <input
                        value={v ?? ""}
                        onChange={(e) => setParamValue(p.id, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,.10)",
                          background: "rgba(255,255,255,.04)",
                          color: "#fff",
                          outline: "none",
                        }}
                      />
                    </label>
                  );
                }

                if (p.type === "number") {
                  return (
                    <label key={p.id}>
                      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>
                        {p.name} <span style={{ opacity: 0.6 }}>({typeLabel(p.type)})</span>
                      </div>
                      <input
                        type="number"
                        value={v ?? ""}
                        onChange={(e) => setParamValue(p.id, e.target.value === "" ? "" : Number(e.target.value))}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,.10)",
                          background: "rgba(255,255,255,.04)",
                          color: "#fff",
                          outline: "none",
                        }}
                      />
                    </label>
                  );
                }

                if (p.type === "boolean") {
                  return (
                    <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(v)}
                        onChange={(e) => setParamValue(p.id, e.target.checked)}
                      />
                      <span style={{ opacity: 0.9 }}>
                        {p.name} <span style={{ opacity: 0.6 }}>({typeLabel(p.type)})</span>
                      </span>
                    </label>
                  );
                }

                if (p.type === "enum") {
                  return (
                    <label key={p.id}>
                      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>
                        {p.name} <span style={{ opacity: 0.6 }}>({typeLabel(p.type)})</span>
                      </div>
                      <select
                        value={v ?? ""}
                        onChange={(e) => setParamValue(p.id, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,.10)",
                          background: "rgba(255,255,255,.04)",
                          color: "#fff",
                          outline: "none",
                        }}
                      >
                        <option value="">—</option>
                        {(p.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }

                const arr = Array.isArray(v) ? v : [];
                return (
                  <div key={p.id}>
                    <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>
                      {p.name} <span style={{ opacity: 0.6 }}>({typeLabel(p.type)})</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {(p.options || []).map((opt) => {
                        const checked = arr.includes(opt);
                        return (
                          <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked ? [...arr, opt] : arr.filter((x) => x !== opt);
                                setParamValue(p.id, next);
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
