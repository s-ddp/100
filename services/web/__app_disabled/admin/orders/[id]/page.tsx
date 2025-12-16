"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  ticketTypeId: string;
  seatId?: string | null;
  price: number;
};

type OrderLog = {
  id: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  user?: string | null;
  createdAt: string;
};

type Order = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  currency: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  items: OrderItem[];
  logs: OrderLog[];
  event: {
    id: string;
    title: string;
  };
};

type Seat = {
  seatId: string;
  status: "taken";
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [order, setOrder] = useState<Order | null>(null);
  const [seatmap, setSeatmap] = useState<Seat[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  const load = async (orderId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      setOrder(data);
      setStatus(data.status);

      const seatmapRes = await fetch(`/api/admin/orders/${orderId}/seatmap`);
      const seatmapJson = await seatmapRes.json();
      setSeatmap(seatmapJson.seats || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof id === "string") {
      load(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async () => {
    if (!order) return;
    setChangingStatus(true);
    try {
      await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await load(order.id);
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading || !order) {
    return <div style={{ padding: 24 }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.push("/admin/orders")}>← Назад</button>

      <h1 style={{ marginTop: 16 }}>Заказ {order.id}</h1>

      <div style={{ marginBottom: 16 }}>
        <div>Событие: {order.event?.title}</div>
        <div>Создан: {new Date(order.createdAt).toLocaleString()}</div>
        <div>Обновлен: {new Date(order.updatedAt).toLocaleString()}</div>
        <div>
          Сумма: {(order.totalAmount / 100).toFixed(2)} {order.currency}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2>Клиент</h2>
        <div>Имя: {order.customerName || "—"}</div>
        <div>Телефон: {order.customerPhone || "—"}</div>
        <div>Email: {order.customerEmail || "—"}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2>Статус</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={changingStatus}
          >
            <option value="PENDING">В ожидании</option>
            <option value="PAID">Оплачен</option>
            <option value="CANCELLED">Отменен</option>
            <option value="REFUNDED">Возврат</option>
          </select>
          <button onClick={changeStatus} disabled={changingStatus}>
            Сохранить
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2>Билеты / места</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 8,
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Ticket Type
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Место
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Цена
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {item.ticketTypeId}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {item.seatId || "—"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {(item.price / 100).toFixed(2)} {order.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2>Лог действий</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 8,
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Время
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Действие
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Было
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Стало
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Пользователь
              </th>
            </tr>
          </thead>
          <tbody>
            {order.logs.map((log) => (
              <tr key={log.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {log.action}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {log.oldValue || "—"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {log.newValue || "—"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {log.user || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2>Seatmap занятых мест</h2>
        <p>
          Здесь можно подключить тот же SVG-seatmap, что и в checkout, но в
          режиме readonly. Пока сделаем простой список:
        </p>
        {seatmap.length === 0 && <div>Нет занятых мест в этом заказе.</div>}
        {seatmap.length > 0 && (
          <ul>
            {seatmap.map((s) => (
              <li key={s.seatId}>{s.seatId}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
