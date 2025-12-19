// services/web/app/page.tsx

import React from "react";

type Event = {
  id: string;
  title: string;
  description?: string;
  date?: string;
};

async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("Failed to fetch events:", res.status);
      return [];
    }

    const json = await res.json();

    // ✅ НОРМАЛИЗАЦИЯ ОТВЕТА
    if (Array.isArray(json)) {
      return json;
    }

    if (Array.isArray(json.events)) {
      return json.events;
    }

    if (Array.isArray(json.data)) {
      return json.data;
    }

    console.error("Unexpected events response shape:", json);
    return [];
  } catch (e) {
    console.error("Fetch events error:", e);
    return [];
  }
}

export default async function Page() {
  const events = await getEvents();

  return (
    <main style={{ padding: 24 }}>
      <h1>События</h1>

      {events.length === 0 && <p>События не найдены</p>}

      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: 12 }}>
            <strong>{event.title}</strong>
            {event.date && <div>{event.date}</div>}
            {event.description && <div>{event.description}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
