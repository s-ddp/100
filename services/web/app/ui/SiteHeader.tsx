@'
import Link from "next/link";
import styles from "./SiteHeader.module.css";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Хиты продаж", href: "/#top-sales" },
  { label: "Экскурсии", href: "/events" },
  { label: "О нас", href: "/about" },
  { label: "Контакты", href: "/contacts" },
];

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/" className={styles.headerLogo}>
          AquaVoyage
        </Link>

        <nav className={styles.headerNav} aria-label="Главное меню">
          {navItems.map((x) => (
            <Link key={x.href} href={x.href} className={styles.headerNavLink}>
              {x.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <div className={styles.headerCart} title="Корзина">
            <i className="fas fa-shopping-cart" />
            <span className={styles.headerCartBadge}>0</span>
          </div>

          <Link className={styles.headerTicketsBtn} href="/me/tickets">
            Мои билеты
          </Link>

          <div className={styles.headerBurger} title="Меню">
            <i className="fas fa-bars" />
          </div>
        </div>
      </div>
    </header>
  );
}
'@ | Set-Content -Encoding utf8 "app\ui\SiteHeader.tsx"
