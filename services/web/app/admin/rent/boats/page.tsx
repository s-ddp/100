"use client";

import { useEffect, useState } from "react";
import { apiAdminGetBoats } from "@/app/lib/api";

export default function ActiveRentBoats() {
  const [boats, setBoats] = useState<any[]>([]);

  useEffect(() => {
    apiAdminGetBoats("?isActive=true").then((r) => setBoats(r.items));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Судно для аренды</h1>

      {boats.length === 0 && <p>Нет активных судов</p>}

      {boats.map((b) => (
        <div key={b.id} style={card}>
          <b>{b.name}</b>
          <span style={{ opacity: 0.6 }}>
            {b.type?.name} · {b.location?.name}
          </span>
        </div>
      ))}
    </main>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #2a2f3a",
  borderRadius: 12,
  padding: 12,
  marginBottom: 8,
};
