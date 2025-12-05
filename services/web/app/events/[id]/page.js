const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function formatDateTime(iso) {
  try {
    const value = new Date(iso);
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(value);
  } catch {
    return iso;
  }
}

async function fetchEvent(id) {
  try {
    const res = await fetch(`${API_URL}/events/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.event) return data.event;
    return data;
  } catch {
    return null;
  }
}

export default async function EventPage({ params }) {
  const event = await fetchEvent(params.id);

  if (!event) {
    return <div>Событие не найдено или API ещё не реализован.</div>;
  }

  const datetime = event.datetime ? formatDateTime(event.datetime) : event.date;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>{event.name || event.title}</h1>
        <p style={{ color: '#9ca3af', marginBottom: 8 }}>
          {datetime} · {event.pierName || event.city}
        </p>
        <p style={{ marginBottom: 12 }}>{event.description}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a
            href={`/events/${params.id}/seatmap`}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: '1px solid #1f2937',
              background: '#0ea5e9',
              color: '#022c3a',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Выбрать места
          </a>
          <button
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              background: '#22c55e',
              color: '#022c22',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Купить билет
          </button>
        </div>
      </div>
    </div>
  );
}
