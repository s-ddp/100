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
          <a href="#">Экскурсии</a>
          <Link href="/rent">Аренда</Link>
          <a href="#">Причалы</a>
          <a href="#">Новости</a>
          <Link href="/help">Уголок покупателя</Link>
          <a href="#">Контакты</a>
        </nav>

        {/* Кнопка */}
        <button className={styles.ticketsButton}>
          Мои билеты
        </button>
      </div>
    </header>
  );
}
