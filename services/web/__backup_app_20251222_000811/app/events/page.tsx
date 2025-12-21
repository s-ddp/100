// services/web/app/events/page.tsx

import Image from "next/image";

type Event = {
  id: string;
  title: string;
  name?: string;
  datetime: string;
  city?: string;
  availableSeats?: number;
  image?: string;
  duration?: number;
};

async function getEvents(): Promise<Event[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await res.json();
  return data.events ?? [];
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main style={{ padding: 24 }}>
      <h1>Экскурсии</h1>

      {events.length === 0 && (
        <p>Экскурсии не найдены</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {events.map((event) => (
          <div
            key={`${event.id}_${event.datetime}`}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {event.image && (
              <Image
                src={event.image}
                alt={event.title}
                width={400}
                height={250}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
              />
            )}

            <div style={{ padding: 12 }}>
              <h3 style={{ marginBottom: 8 }}>
                {event.title || event.name}
              </h3>

              <div>📍 {event.city}</div>
              <div>
                🕒{" "}
                {new Date(event.datetime).toLocaleString("ru-RU")}
              </div>

              {event.duration && (
                <div>⏱ {event.duration} мин</div>
              )}

              {typeof event.availableSeats === "number" && (
                <div>🪑 Мест: {event.availableSeats}</div>
              )}

              <button
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px 12px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Выбрать места
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
