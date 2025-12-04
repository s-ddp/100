const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchHealth() {
  try {
    const res = await fetch(`${API_URL}/status`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await fetchHealth();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Платформа продажи билетов</h1>
      <p style={{ marginBottom: 32, color: '#9ca3af' }}>
        Здесь будет витрина событий, покупки билетов, личный кабинет и CRM.
      </p>

      <section
        style={{
          border: '1px solid #1f2937',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          background: '#020617'
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Статус backend API</h2>
        {health ? (
          <pre
            style={{
              background: '#020617',
              padding: 12,
              borderRadius: 12,
              border: '1px solid #111827',
              fontSize: 13,
              overflowX: 'auto'
            }}
          >
{JSON.stringify(health, null, 2)}
          </pre>
        ) : (
          <p style={{ color: '#f97373' }}>
            Не удалось получить статус API по адресу {API_URL}/status
          </p>
        )}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}
      >
        <Card
          title="Каталог событий"
          text="Список мероприятий, концертов, спектаклей. Фильтры, поиск, даты."
        />
        <Card
          title="Покупка билетов"
          text="Выбор мест, оформление заказа, оплата через ЮKassa, выдача e-ticket."
        />
        <Card
          title="CRM для операторов"
          text="История заказов, статусы, возвраты, отчеты, динамика продаж."
        />
      </section>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: 16,
        border: '1px solid #1f2937',
        background: '#020617'
      }}
    >
      <h3 style={{ marginBottom: 8, fontSize: 18 }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#9ca3af' }}>{text}</p>
    </div>
  );
}
