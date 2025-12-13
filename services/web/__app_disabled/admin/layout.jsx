export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b1224", color: "#e5e7eb" }}>
      <header
        style={{
          borderBottom: "1px solid #1f2937",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#020617",
        }}
      >
        <div style={{ fontWeight: 700 }}>100Tickets — Admin</div>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <a href="/admin/orders" style={{ color: "#e5e7eb", textDecoration: "none" }}>
            Заказы
          </a>
          <a href="/events" style={{ color: "#e5e7eb", textDecoration: "none" }}>
            События
          </a>
        </nav>
      </header>
      <main style={{ padding: "24px" }}>{children}</main>
    </div>
  );
}
