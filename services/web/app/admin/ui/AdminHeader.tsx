import styles from "./AdminHeader.module.css";

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>AquaVoyage Admin</div>
      <div className={styles.actions}>Панель управления</div>
    </header>
  );
}
