import type { GetServerSideProps, NextPage } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Event = {
  id: string | number;
  name?: string;
  title?: string;
  datetime?: string;
  date?: string;
  pierName?: string;
  city?: string;
};

type Props = {
  events: Event[];
};

const EventsPage: NextPage<Props> = ({ events }) => {
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
                background: '#020617',
              }}
            >
              <a
                href={`/events/${event.id}`}
                style={{ color: '#e5e7eb', textDecoration: 'none' }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{event.name || event.title}</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {event.datetime ? formatDateTime(event.datetime) : event.date || ''} ·{' '}
                  {event.pierName || event.city || ''}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const res = await fetch(`${API_URL}/events`);
    if (!res.ok) return { props: { events: [] } };
    const data = await res.json();
    if (Array.isArray(data)) return { props: { events: data } };
    if (Array.isArray((data as any).events)) return { props: { events: (data as any).events } };
    return { props: { events: [] } };
  } catch {
    return { props: { events: [] } };
  }
};

function formatDateTime(iso?: string) {
  if (!iso) return '';
  try {
    const value = new Date(iso);
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(value);
  } catch {
    return iso;
  }
}

export default EventsPage;
