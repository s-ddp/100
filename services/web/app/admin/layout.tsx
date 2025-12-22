import AdminHeader from "./ui/AdminHeader";
import AdminSidebar from "./ui/AdminSidebar";
import styles from "./admin-layout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <AdminHeader />
      <div className={styles.body}>
        <AdminSidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
