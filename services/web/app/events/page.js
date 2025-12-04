const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchEvents() {
  try {
    const res = await fetch(`${API_URL}/events`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const events = await fetchEvents();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>События</h1>
      {!events.length ? (
        <p style={{ color: '#9ca3af' }}>
          Пока нет событий или не настроен маршрут /events на backend.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {events.map((event) => (
            <li
              key={event.id}
              style={{
                borderRadius: 12,
                border: '1px solid #1f2937',
                padding: 16,
                background: '#020617'
              }}
            >
              <a
                href={`/events/${event.id}`}
                style={{ color: '#e5e7eb', textDecoration: 'none' }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{event.title}</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {event.date} · {event.city}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
