export const metadata = {
  title: '100Tickets',
  description: 'Платформа продажи билетов'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head />
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: '#0f172a',
          color: '#e5e7eb'
        }}
      >
        <header
          style={{
            borderBottom: '1px solid #1f2933',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#020617'
          }}
        >
          <div style={{ fontWeight: 700 }}>100Tickets</div>
          <nav style={{ display: 'flex', gap: '16px', fontSize: 14 }}>
            <a href="/" style={{ color: '#e5e7eb', textDecoration: 'none' }}>Каталог</a>
            <a href="/events" style={{ color: '#e5e7eb', textDecoration: 'none' }}>События</a>
            <a href="/orders" style={{ color: '#e5e7eb', textDecoration: 'none' }}>Мои билеты</a>
          </nav>
        </header>
        <main style={{ padding: '24px' }}>{children}</main>
      </body>
    </html>
  );
}
