'use client';

export default function GlobalError({ reset }) {
  return (
    <html>
      <body>
        <div style={{ padding: 32 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Произошла ошибка</h1>
          <p style={{ color: '#9ca3af', marginBottom: 16 }}>
            Что-то пошло не так. Попробуйте обновить страницу.
          </p>
          <button onClick={() => reset?.()} style={{ padding: '8px 12px' }}>
            Обновить
          </button>
        </div>
      </body>
    </html>
  );
}
