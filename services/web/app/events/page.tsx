import Link from "next/link";

type Event = {
  id: string;
  title: string;
  description?: string;
  startsAt: string;
};

async function getEvents(): Promise<Event[]> {
  const res = await fetch("http://localhost/api/events", {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main style={{ padding: 24 }}>
      <h1>События</h1>

      {events.length === 0 && <p>Событий пока нет</p>}

      <ul style={{ display: "grid", gap: 16 }}>
        {events.map((e) => (
          <li key={e.id} style={{ border: "1px solid #333", padding: 16 }}>
            <h2>{e.title}</h2>
            <p>{e.description}</p>
            <p>
              Дата: {new Date(e.startsAt).toLocaleString("ru-RU")}
            </p>
            <Link href={`/events/${e.id}`}>Выбрать билеты →</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
