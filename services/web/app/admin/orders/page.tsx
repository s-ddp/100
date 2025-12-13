"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  currency: string;
  customerName?: string | null;
};

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const load = async (pageNum: number, statusFilter: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      setOrders(json.data || []);
      setPagination(json.pagination || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    load(1, newStatus);
  };

  const goToPage = (p: number) => {
    setPage(p);
    load(p, status);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Заказы</h1>

      <div style={{ marginBottom: 16 }}>
        <label>Фильтр по статусу: </label>
        <select
          value={status}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="">Все</option>
          <option value="PENDING">В ожидании</option>
          <option value="PAID">Оплачен</option>
          <option value="CANCELLED">Отменен</option>
          <option value="REFUNDED">Возврат</option>
        </select>
      </div>

      {loading && <div>Загрузка...</div>}

      {!loading && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 16,
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                ID
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Дата
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Клиент
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Сумма
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                Статус
              </th>
              <th style={{ borderBottom: "1px solid #ccc", padding: 8 }} />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {o.id}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {o.customerName || "—"}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {(o.totalAmount / 100).toFixed(2)} {o.currency}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {o.status}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  <Link href={`/admin/orders/${o.id}`}>Открыть</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ marginTop: 16 }}>
          Страница {pagination.page} из {pagination.totalPages}
          <div style={{ marginTop: 8 }}>
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  disabled={p === pagination.page}
                  style={{ marginRight: 4 }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
