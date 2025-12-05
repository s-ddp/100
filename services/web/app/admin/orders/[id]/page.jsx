"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OrderDetail({ params }) {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadOrder() {
    setLoading(true);
    const res = await fetch(`${API_URL}/admin/orders/${id}`, {
      headers: { "x-user-role": "admin" },
    });
    const data = await res.json();
    setOrder(data.order ?? null);
    setLoading(false);
  }

  async function changeStatus(status) {
    await fetch(`${API_URL}/admin/orders/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ status }),
    });
    await loadOrder();
  }

  async function cancelOrder() {
    await fetch(`${API_URL}/admin/orders/${id}/cancel`, {
      method: "POST",
      headers: { "x-user-role": "admin" },
    });
    await loadOrder();
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (!order) return <div>Заказ не найден</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <a href="/admin/orders" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14 }}>
        ← Назад к списку
      </a>

      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Заказ {order.id.slice(0, 8)}…</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <div style={cardStyle}>
          <InfoRow label="Событие" value={order.event?.name || order.eventId} />
          <InfoRow label="Статус" value={order.status} />
          <InfoRow label="Создан" value={new Date(order.createdAt).toLocaleString("ru-RU")} />
          <InfoRow label="Сумма" value={formatMoney(order.totalPrice)} />
          <InfoRow
            label="Оплата"
            value={order.paymentStatus ? `${order.paymentStatus} (${order.paymentId ?? "—"})` : "—"}
          />
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>Клиент</div>
          <div style={{ display: "grid", gap: 4 }}>
            <span>{order.customerName || "—"}</span>
            <span>{order.customerEmail || "—"}</span>
            <span>{order.customerPhone || "—"}</span>
          </div>
          <div style={{ borderTop: "1px solid #1f2937", paddingTop: 12, marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>Управление</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={primaryButton} onClick={() => changeStatus("PAID")}>
                Пометить как оплаченный
              </button>
              <button style={secondaryButton} onClick={cancelOrder}>
                Отменить заказ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#0f172a", borderBottom: "1px solid #1f2937" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 12, color: "#9ca3af", fontSize: 13 }}>Место</th>
              <th style={{ textAlign: "left", padding: 12, color: "#9ca3af", fontSize: 13 }}>Цена</th>
            </tr>
          </thead>
          <tbody>
            {order.seats?.map((seat) => (
              <tr key={seat.id} style={{ borderTop: "1px solid #1f2937" }}>
                <td style={cellStyle}>{seat.seatCode}</td>
                <td style={cellStyle}>{formatMoney(seat.price)}</td>
              </tr>
            ))}
            {(!order.seats || order.seats.length === 0) && (
              <tr>
                <td colSpan={2} style={{ padding: 14, textAlign: "center", color: "#9ca3af" }}>
                  Без конкретных мест
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
      <span style={{ color: "#9ca3af" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function formatMoney(value) {
  return `${(Number(value || 0) / 100).toLocaleString("ru-RU")} ₽`;
}

const cardStyle = {
  border: "1px solid #1f2937",
  borderRadius: 12,
  padding: 16,
  background: "#0f172a",
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
  color: "#fca5a5",
  border: "1px solid #7f1d1d",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
};

const cellStyle = {
  padding: "10px 12px",
  fontSize: 14,
};
