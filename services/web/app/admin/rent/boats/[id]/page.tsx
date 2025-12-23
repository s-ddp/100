"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  apiAdminGetBoat,
  apiAdminToggleBoatActive,
  apiAdminUpdateBoat,
  apiGetBoatTypes,
  apiGetLocations,
} from "@/app/lib/api";

type Boat = any;

type Option = { id: string; name: string };

export default function AdminBoatCardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;

  const [boat, setBoat] = useState<Boat | null>(null);
  const [types, setTypes] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imagesText, setImagesText] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [tRes, lRes, boatRes] = await Promise.all([
          apiGetBoatTypes(),
          apiGetLocations(),
          apiAdminGetBoat(id),
        ]);
        setTypes(tRes.items);
        setLocations(lRes.items);
        setBoat(boatRes.item);
        setImagesText((boatRes.item.images || []).map((i: any) => i.url).join("\n"));
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить судно");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const parameters = useMemo(() => boat?.parameters || [], [boat]);

  async function save() {
    if (!boat) return;
    setSaving(true);
    setError(null);
    try {
      const images = imagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url, idx) => ({ url, sortOrder: idx }));

      const payload = {
        name: boat.name,
        description: boat.description,
        typeId: boat.typeId,
        locationId: boat.locationId,
        isActive: boat.isActive,
        images,
        parameters: parameters.map((p: any) => ({
          parameterId: p.parameterId,
          valueText: p.valueText ?? null,
          valueNumber: typeof p.valueNumber === "number" ? p.valueNumber : null,
          valueBool: typeof p.valueBool === "boolean" ? p.valueBool : null,
        })),
      };

      const res = await apiAdminUpdateBoat(id, payload);
      setBoat(res.item);
      setImagesText((res.item.images || []).map((i: any) => i.url).join("\n"));
    } catch (e: any) {
      setError(e?.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(next: boolean) {
    try {
      await apiAdminToggleBoatActive(id, next);
      setBoat((prev: any) => (prev ? { ...prev, isActive: next } : prev));
    } catch (e: any) {
      alert(e?.message || "Не удалось изменить активность");
    }
  }

  if (loading) return <div style={{ padding: 28 }}>Загрузка карточки судна…</div>;
  if (!boat) return <div style={{ padding: 28 }}>Судно не найдено</div>;

  return (
    <div style={{ padding: 28, display: "grid", gap: 16, maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ opacity: 0.7, marginBottom: 6 }}>
            <Link href="/admin/rent/boats" style={{ color: "#0b4bff", textDecoration: "none" }}>
              ← Судна
            </Link>
          </div>
          <h1 style={{ fontSize: 28, margin: 0 }}>{boat.name || "Судно"}</h1>
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={Boolean(boat.isActive)}
            onChange={(e) => toggleActive(e.target.checked)}
          />
          Активно
        </label>
      </div>

      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <input
            value={boat.name || ""}
            onChange={(e) => setBoat({ ...boat, name: e.target.value })}
            placeholder="Название"
            style={input()}
          />

          <textarea
            value={boat.description || ""}
            onChange={(e) => setBoat({ ...boat, description: e.target.value })}
            placeholder="Описание"
            style={{ ...input(), minHeight: 120 }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <select
              value={boat.typeId}
              onChange={(e) => setBoat({ ...boat, typeId: e.target.value })}
              style={input()}
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={boat.locationId}
              onChange={(e) => setBoat({ ...boat, locationId: e.target.value })}
              style={input()}
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            placeholder="Фото (URL). По одной ссылке в строке."
            style={{ ...input(), minHeight: 100 }}
          />

          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "black",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
              width: 200,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Параметры</div>
        {parameters.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Параметры пока не заданы.</div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {parameters.map((p: any) => (
              <span
                key={p.id}
                style={{
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 10,
                  background: "#f5f5f5",
                }}
              >
                {p.parameter?.name}: {p.valueText ?? p.valueNumber ?? (typeof p.valueBool === "boolean" ? (p.valueBool ? "да" : "нет") : "")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function input(): React.CSSProperties {
  return { padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", outline: "none" };
}
