// services/web/app/events/page.tsx
"use client";

import { useEffect, useState } from "react";

type Event = {
  id: string;
  title: string;
  description?: string;
  startsAt: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(setEvents)
      .catch(() => setError("События не найдены"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>События</h1>

      {loading && <p>Загрузка…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {events.length === 0 && !loading && (
        <p>Пока нет доступных событий</p>
      )}

      <ul style={{ marginTop: 20 }}>
        {events.map((e) => (
          <li key={e.id} style={{ marginBottom: 16 }}>
            <strong>{e.title}</strong>
            <div>{new Date(e.startsAt).toLocaleString("ru-RU")}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
