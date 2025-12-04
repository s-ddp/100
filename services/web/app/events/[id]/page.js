const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{event.title}</h1>
      <p style={{ color: '#9ca3af', marginBottom: 16 }}>
        {event.date} · {event.city}
      </p>
      <p style={{ marginBottom: 24 }}>{event.description}</p>
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
  );
}
