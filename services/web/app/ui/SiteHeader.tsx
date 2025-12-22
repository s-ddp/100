import Link from "next/link";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Логотип */}
        <div className={styles.logo}>
          AquaVoyage
        </div>

        {/* Навигация */}
        <nav className={styles.nav}>
          <Link href="/">Главная</Link>
          <Link href="/excursions/reki-i-kanaly">Экскурсии</Link>
          <Link href="/rent">Аренда</Link>
          <Link href="/help">Уголок покупателя</Link>
          <Link href="/contacts">Контакты</Link>
          <Link href="/admin">Admin</Link>
        </nav>

        {/* Кнопка */}
        <button className={styles.ticketsButton}>
          Мои билеты
        </button>
      </div>
    </header>
  );
}
