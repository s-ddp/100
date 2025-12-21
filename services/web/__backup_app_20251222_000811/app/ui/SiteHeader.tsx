@'
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo">
          AquaVoyage
        </Link>

        <nav className="header-nav">
          <Link href="/" className="header-nav-link">
            Главная
          </Link>
          <Link href="/#top-sales" className="header-nav-link">
            Хиты продаж
          </Link>
          <Link href="/events" className="header-nav-link">
            Экскурсии
          </Link>
          <Link href="/about" className="header-nav-link">
            О нас
          </Link>
          <Link href="/contacts" className="header-nav-link">
            Контакты
          </Link>
        </nav>

        <div className="header-actions">
          <div className="header-cart" aria-label="Корзина">
            <i className="fas fa-shopping-cart" />
            <span className="header-cart-badge">0</span>
          </div>

          <Link href="/me/tickets" className="header-tickets-btn">
            Мои билеты
          </Link>

          <div className="header-burger" aria-label="Меню">
            <i className="fas fa-bars" />
          </div>
        </div>
      </div>
    </header>
  );
}
'@ | Set-Content -Encoding utf8 "app\ui\SiteHeader.tsx"
