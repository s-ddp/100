"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiAdminCreateBoat, apiGetBoatTypes, apiGetLocations } from "@/app/lib/api";

export default function NewBoatPage() {
  const router = useRouter();
  const [types, setTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, l] = await Promise.all([apiGetBoatTypes(), apiGetLocations()]);
      setTypes(t.items);
      setLocations(l.items);
      setTypeId(t.items[0]?.id);
      setLocationId(l.items[0]?.id);
    })();
  }, []);

  async function save() {
    const res = await apiAdminCreateBoat({
      name,
      description,
      typeId,
      locationId,
      isActive,
      images: [],
      parameters: [],
    });
    router.push(`/admin/boats/${res.item.id}`);
  }

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <h1>Добавить судно</h1>

      <input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} style={input} />
      <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} style={textarea} />

      <select value={typeId} onChange={(e) => setTypeId(e.target.value)} style={input}>
        {types.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select value={locationId} onChange={(e) => setLocationId(e.target.value)} style={input}>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>

      <label>
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Активно для аренды
      </label>

      <button onClick={save} style={btnPrimary}>Сохранить</button>
    </main>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
};

const textarea: React.CSSProperties = {
  ...input,
  height: 120,
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "#0b5cff",
  color: "#fff",
  border: "none",
};
