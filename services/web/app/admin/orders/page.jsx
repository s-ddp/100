"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: "", eventId: "", email: "", phone: "" });

  async function loadOrders() {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    const res = await fetch(`${API_URL}/admin/orders?${params.toString()}`, {
      headers: { "x-user-role": "admin" },
    });
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>CRM — Заказы</h1>

      <div style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, background: "#0f172a" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <input
            style={inputStyle}
            placeholder="Email"
            value={filters.email}
            onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            style={inputStyle}
            placeholder="Телефон"
            value={filters.phone}
            onChange={(e) => setFilters((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            style={inputStyle}
            placeholder="ID события"
            value={filters.eventId}
            onChange={(e) => setFilters((f) => ({ ...f, eventId: e.target.value }))}
          />
          <select
            style={inputStyle}
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">Все статусы</option>
            <option value="PENDING">Ожидает</option>
            <option value="LOCKED">Забронирован</option>
            <option value="PAID">Оплачен</option>
            <option value="CANCELLED">Отменен</option>
            <option value="EXPIRED">Истек</option>
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button
            style={secondaryButton}
            onClick={() => setFilters({ status: "", eventId: "", email: "", phone: "" })}
          >
            Сбросить
          </button>
          <button style={primaryButton} onClick={loadOrders}>
            Применить
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#0f172a", borderBottom: "1px solid #1f2937" }}>
            <tr>
              {[
                "ID",
                "Событие",
                "Клиент",
                "Статус",
                "Места",
                "Сумма",
                "Действия",
              ].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 12px", fontSize: 13, color: "#9ca3af" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ padding: 14, textAlign: "center", color: "#9ca3af" }}>
                  Загрузка...
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 14, textAlign: "center", color: "#9ca3af" }}>
                  Заказы не найдены
                </td>
              </tr>
            )}
            {!loading &&
              orders.map((o) => (
                <tr key={o.id} style={{ borderTop: "1px solid #1f2937" }}>
                  <td style={cellStyle}>
                    <a href={`/admin/orders/${o.id}`} style={{ color: "#34d399", textDecoration: "none" }}>
                      {o.id.slice(0, 8)}…
                    </a>
                  </td>
                  <td style={cellStyle}>{o.event?.name || o.eventId}</td>
                  <td style={cellStyle}>{o.customerEmail || o.customerPhone || "—"}</td>
                  <td style={cellStyle}>{o.status}</td>
                  <td style={cellStyle}>{o.seats?.length ?? 0}</td>
                  <td style={cellStyle}>{formatMoney(o.totalPrice)}</td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    <a
                      href={`/admin/orders/${o.id}`}
                      style={{
                        color: "#e5e7eb",
                        border: "1px solid #374151",
                        padding: "6px 8px",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontSize: 12,
                      }}
                    >
                      Открыть
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatMoney(value) {
  return `${(Number(value || 0) / 100).toLocaleString("ru-RU")} ₽`;
}

const inputStyle = {
  background: "#0b1224",
  border: "1px solid #1f2937",
  borderRadius: 10,
  padding: "10px 12px",
  color: "#e5e7eb",
  fontSize: 14,
  outline: "none",
};

const primaryButton = {
  background: "#34d399",
  color: "#0b1224",
  border: "1px solid #10b981",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButton = {
  background: "transparent",
  color: "#e5e7eb",
  border: "1px solid #374151",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
};

const cellStyle = {
  padding: "10px 12px",
  fontSize: 14,
};
