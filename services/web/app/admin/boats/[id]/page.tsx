"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  apiAdminGetBoat,
  apiAdminUpdateBoat,
  apiGetBoatTypes,
  apiGetLocations,
} from "@/app/lib/api";
import BoatParametersEditor from "@/app/components/BoatParametersEditor";
import BoatImagesEditor from "@/app/components/BoatImagesEditor";

export default function EditBoatPage() {
  const { id } = useParams<{ id: string }>();
  const [boat, setBoat] = useState<any>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  async function load() {
    const [b, t, l] = await Promise.all([
      apiAdminGetBoat(id),
      apiGetBoatTypes(),
      apiGetLocations(),
    ]);
    setBoat(b.item);
    setTypes(t.items);
    setLocations(l.items);
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!boat) return <p>Загрузка…</p>;

  async function saveMain() {
    await apiAdminUpdateBoat(id, {
      name: boat.name,
      description: boat.description,
      typeId: boat.typeId,
      locationId: boat.locationId,
      isActive: boat.isActive,
    });
    alert("Основные данные сохранены");
  }

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>Редактирование судна</h1>

      <input
        value={boat.name}
        onChange={(e) => setBoat({ ...boat, name: e.target.value })}
        style={input}
      />

      <textarea
        value={boat.description || ""}
        onChange={(e) =>
          setBoat({ ...boat, description: e.target.value })
        }
        style={textarea}
      />

      <select
        value={boat.typeId}
        onChange={(e) => setBoat({ ...boat, typeId: e.target.value })}
        style={input}
      >
        {types.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        value={boat.locationId}
        onChange={(e) =>
          setBoat({ ...boat, locationId: e.target.value })
        }
        style={input}
      >
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={boat.isActive}
          onChange={(e) =>
            setBoat({ ...boat, isActive: e.target.checked })
          }
        />{" "}
        Активно для аренды
      </label>

      <button onClick={saveMain} style={btnPrimary}>
        Сохранить основные данные
      </button>

      <BoatImagesEditor
        boatId={id}
        images={boat.images || []}
        onChange={load}
      />

      <BoatParametersEditor
        boatId={id}
        initial={boat.parameters || []}
      />
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
