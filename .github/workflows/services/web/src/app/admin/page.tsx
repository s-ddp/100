import AdminShell from "@/components/admin/AdminShell";

export default function AdminHome() {
  return (
    <AdminShell title="Панель управления">
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          Здесь будет “быстрый доступ”, сводка заказов, оплаты, последние действия.
        </div>
        <div style={{ padding: 14, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12 }}>
          Следующий шаг: сделать реальные страницы “Заказы / Клиенты / Финансы” и подключить API.
        </div>
      </div>
    </AdminShell>
  );
}
