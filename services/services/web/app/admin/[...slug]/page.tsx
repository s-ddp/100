import AdminShell from "../../_components/admin/AdminShell";

export default function AdminCatchAllPage(props: { params: { slug: string[] } }) {
  const slug = props.params.slug || [];
  const title = slug.join(" / ");

  return (
    <AdminShell title={title || "Раздел"}>
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          URL: <code>/admin/{slug.join("/")}</code>
        </div>
        <div style={{ padding: 14, border: "1px dashed rgba(0,0,0,0.18)", borderRadius: 12 }}>
          Заглушка раздела. Следующий шаг — реальные таблицы/формы.
        </div>
      </div>
    </AdminShell>
  );
}
