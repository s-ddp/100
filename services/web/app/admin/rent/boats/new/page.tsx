"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiAdminCreateBoat, apiGetBoatTypes, apiGetLocations } from "@/app/lib/api";

export default function AdminBoatNewPage() {
  const router = useRouter();

  const [types, setTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [imagesText, setImagesText] = useState(""); // urls, one per line

  useEffect(() => {
    (async () => {
      const [t, l] = await Promise.all([apiGetBoatTypes(), apiGetLocations()]);
      setTypes(t.items);
      setLocations(l.items);
      setTypeId(t.items?.[0]?.id || "");
      setLocationId(l.items?.[0]?.id || "");
      setLoading(false);
    })();
  }, []);

  async function onCreate() {
    const images = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((url, idx) => ({ url, sortOrder: idx }));

    const payload = {
      name,
      description,
      typeId,
      locationId,
      isActive,
      images,
      parameters: [],
    };

    const res = await apiAdminCreateBoat(payload);
    router.push(`/admin/rent/boats/${res.item.id}`);
  }

  if (loading) return <main style={{ padding: 20 }}>Загрузка…</main>;

  return (
    <main style={{ padding: 20, maxWidth: 900 }}>
      <h1>Завести судно</h1>

      <div style={{ display: "grid", gap: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" style={input()} />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание"
          style={{ ...input(), minHeight: 120 }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <select value={typeId} onChange={(e) => setTypeId(e.target.value)} style={input()}>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} style={input()}>
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

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Активно для аренды
        </label>

        <button
          onClick={onCreate}
          disabled={!name || !typeId || !locationId}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "black",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
            width: 220,
          }}
        >
          Создать
        </button>
      </div>
    </main>
  );
}

function input(): React.CSSProperties {
  return { padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", outline: "none" };
}
