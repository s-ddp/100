import Link from "next/link";
import styles from "./AdminSidebar.module.css";

export default function AdminSidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <Link href="/admin">Главная</Link>
        <Link href="/admin/orders">Заказы</Link>
      </nav>
    </aside>
  );
}
