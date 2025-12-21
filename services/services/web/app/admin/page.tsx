import AdminShell from "../_components/admin/AdminShell";

export default function AdminHome() {
  return (
    <AdminShell title="Панель управления">
      <div style={{ display: "grid", gap: 12 }}>
        <div>Выбери раздел слева — тут будет открываться содержимое.</div>
        <div style={{ padding: 14, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12 }}>
          Дальше делаем: “Заказы / Клиенты / Финансы” (таблицы + фильтры + карточки).
        </div>
      </div>
    </AdminShell>
  );
}
