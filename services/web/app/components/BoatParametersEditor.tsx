"use client";

import { useEffect, useState } from "react";
import { apiGetParameters, apiSaveBoatParameters } from "@/app/lib/api";

export default function BoatParametersEditor({
  boatId,
  initial,
}: {
  boatId: string;
  initial: any[];
}) {
  const [dict, setDict] = useState<any[]>([]);
  const [values, setValues] = useState<any[]>(initial || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetParameters().then((r) => {
      setDict(r.items);
      setLoading(false);
    });
  }, []);

  function setValue(parameterId: string, patch: any) {
    setValues((prev) => {
      const existing = prev.find((v) => v.parameterId === parameterId);
      if (existing) {
        return prev.map((v) => (v.parameterId === parameterId ? { ...v, ...patch } : v));
      }
      return [...prev, { parameterId, ...patch }];
    });
  }

  async function save() {
    await apiSaveBoatParameters(boatId, values);
    alert("Параметры сохранены");
  }

  if (loading) return <p>Загрузка параметров…</p>;

  return (
    <section style={block}>
      <h2>Характеристики судна</h2>

      {dict.map((p) => {
        const val = values.find((v) => v.parameterId === p.id) || {};
        return (
          <div key={p.id} style={row}>
            <label style={{ width: 240 }}>{p.name}</label>

            {p.type === "NUMBER" && (
              <input
                type="number"
                value={val.valueNumber ?? ""}
                onChange={(e) => setValue(p.id, { valueNumber: Number(e.target.value) })}
              />
            )}

            {p.type === "TEXT" && (
              <input value={val.valueText ?? ""} onChange={(e) => setValue(p.id, { valueText: e.target.value })} />
            )}

            {p.type === "BOOL" && (
              <input
                type="checkbox"
                checked={Boolean(val.valueBool)}
                onChange={(e) => setValue(p.id, { valueBool: e.target.checked })}
              />
            )}
          </div>
        );
      })}

      <button onClick={save} style={btnPrimary}>
        Сохранить параметры
      </button>
    </section>
  );
}

const block: React.CSSProperties = {
  marginTop: 32,
  padding: 16,
  border: "1px solid #2a2f3a",
  borderRadius: 12,
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  marginBottom: 10,
};

const btnPrimary: React.CSSProperties = {
  marginTop: 12,
  padding: "8px 14px",
  borderRadius: 10,
  background: "#0b5cff",
  color: "#fff",
  border: "none",
};
