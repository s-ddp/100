$ErrorActionPreference = "Stop"

$webRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $webRoot

function WriteFile([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  Set-Content -Path $Path -Value $Content -Encoding utf8
}

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

New-Item -ItemType Directory -Force -Path "app\ui" | Out-Null
New-Item -ItemType Directory -Force -Path "app\_components" | Out-Null

# -------------------------
# app/globals.css
# -------------------------
WriteFile "app\globals.css" @'
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

* { box-sizing: border-box; }
html, body { padding: 0; margin: 0; }

body {
  background: #fff;
  padding-top: 80px;
  font-family: "Roboto", system-ui, -apple-system, Segoe UI, Arial, sans-serif;
  color: #212121;
}

a { color: inherit; }
'@

# -------------------------
# app/layout.tsx
# -------------------------
WriteFile "app\layout.tsx" @'
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import SiteHeader from "./ui/SiteHeader";
import SiteFooter from "./ui/SiteFooter";

export const metadata: Metadata = {
  title: "AquaVoyage — билеты на водные экскурсии",
  description: "Билеты на водные экскурсии и прогулки",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
'@

# -------------------------
# Header
# -------------------------
WriteFile "app\ui\SiteHeader.tsx" @'
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
'@

WriteFile "app\ui\SiteHeader.module.css" @'
.header {
  position: fixed; top: 0; left: 0; width: 100%;
  background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 100; padding: 16px 0;
}

.headerContainer {
  max-width: 1400px; margin: 0 auto; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}

.headerLogo { font-size: 20px; font-weight: 700; color: #0055FB; text-decoration: none; white-space: nowrap; }

.headerNav { display: flex; gap: 32px; align-items: center; justify-content: center; flex: 1; }

.headerNavLink {
  font-size: 14px; font-weight: 500; color: #212121; text-decoration: none;
  transition: color 0.2s; white-space: nowrap;
}
.headerNavLink:hover { color: #0055FB; }

.headerActions { display: flex; gap: 16px; align-items: center; }

.headerCart { position: relative; font-size: 20px; color: #212121; cursor: pointer; line-height: 1; }

.headerCartBadge {
  position: absolute; top: -8px; right: -8px;
  width: 18px; height: 18px; background: #FF6B00; color: #fff;
  font-size: 10px; font-weight: 500; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.headerTicketsBtn {
  padding: 8px 16px; border-radius: 6px; background: #0055FB; color: #fff;
  font-size: 14px; font-weight: 500; text-decoration: none; transition: background 0.2s; white-space: nowrap;
}
.headerTicketsBtn:hover { background: #0044CC; }

.headerBurger { display: none; font-size: 24px; color: #212121; cursor: pointer; }

@media (max-width: 1024px) { .headerNav { display: none; } .headerBurger { display: block; } }
@media (max-width: 480px) { .headerTicketsBtn { display: none; } }
'@

# -------------------------
# Footer
# -------------------------
WriteFile "app\ui\SiteFooter.tsx" @'
import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerColumn}>
            <h3>AquaVoyage</h3>
            <p className={styles.footerText}>
              Лучшие водные экскурсии и круизы по Петербургу и окрестностям
            </p>
            <div className={styles.footerSocials}>
              <a href="#" className={styles.footerSocialLink} aria-label="VK"><i className="fab fa-vk" /></a>
              <a href="#" className={styles.footerSocialLink} aria-label="Instagram"><i className="fab fa-instagram" /></a>
              <a href="#" className={styles.footerSocialLink} aria-label="Telegram"><i className="fab fa-telegram" /></a>
              <a href="#" className={styles.footerSocialLink} aria-label="WhatsApp"><i className="fab fa-whatsapp" /></a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3>Навигация</h3>
            <ul>
              <li><Link href="/">Главная</Link></li>
              <li><Link href="/#top-sales">Хиты продаж</Link></li>
              <li><Link href="/events">Все экскурсии</Link></li>
              <li><Link href="/about">О нас</Link></li>
              <li><Link href="/contacts">Контакты</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3>Контакты</h3>
            <div className={styles.footerContactItem}><i className="fas fa-map-marker-alt" /><span>Санкт-Петербург, Причал №5</span></div>
            <div className={styles.footerContactItem}><i className="fas fa-phone" /><span>+7 (812) 123-45-67</span></div>
            <div className={styles.footerContactItem}><i className="fas fa-envelope" /><span>info@aquavoyage.ru</span></div>
            <div className={styles.footerContactItem}><i className="fas fa-clock" /><span>Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00</span></div>
          </div>

          <div className={styles.footerColumn}>
            <h3>Полезное</h3>
            <ul>
              <li><Link href="/rules">Правила покупки билетов</Link></li>
              <li><Link href="/privacy">Политика конфиденциальности</Link></li>
              <li><Link href="/payments">Оплата и возврат</Link></li>
              <li><Link href="/promo">Акции и скидки</Link></li>
              <li><Link href="/gift">Подарочные сертификаты</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerCopyright}>
          © 2025 AquaVoyage. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
'@

WriteFile "app\ui\SiteFooter.module.css" @'
.footer { background: #0F172A; color: #fff; padding: 60px 0 24px; margin-top: 40px; }
.footerContainer { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
.footerGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; margin-bottom: 40px; }
.footerColumn h3 { font-size: 16px; font-weight: 700; margin: 0 0 16px 0; }
.footerColumn ul { list-style: none; padding: 0; margin: 0; }
.footerColumn ul li { margin-bottom: 12px; }
.footerColumn ul li a { font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s; }
.footerColumn ul li a:hover { color: #fff; }
.footerText { font-size: 14px; color: rgba(255,255,255,0.7); margin: 0 0 16px 0; }
.footerContactItem { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 12px; }
.footerSocials { display: flex; gap: 16px; margin-top: 16px; }
.footerSocialLink { font-size: 20px; color: rgba(255,255,255,0.7); transition: color 0.2s; }
.footerSocialLink:hover { color: #0055FB; }
.footerCopyright { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; font-size: 12px; color: rgba(255,255,255,0.5); text-align: center; }
'@

# -------------------------
# Главный CSS под твой дизайн
# -------------------------
WriteFile "app\home.module.css" @'
.topSalesBlock { background: #F0F8FF; padding: 40px 0; margin-bottom: 24px; border-bottom: 1px solid #e0e8f0; }
.blockContainer { max-width: 1400px; margin: 0 auto; padding: 0 24px; position: relative; }

.blockHeader { margin-bottom: 20px; padding: 0 8px; }
.blockTitle { font-size: 24px; font-weight: 700; color: #212121; margin: 0 0 4px 0; }
.blockSubtitle { font-size: 14px; color: #666; margin: 0; }

.arrow {
  position: absolute; top: calc(50% + 20px); transform: translateY(-50%);
  width: 40px; height: 40px; border: none;
  background: rgba(255,255,255,0.95); border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 20px; color: #666; cursor: pointer; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, background 0.2s;
}
.arrow:hover { background: #fff; }
.arrow:disabled { opacity: 0.3; cursor: default; pointer-events: none; }
.arrowLeft { left: 0; }
.arrowRight { right: 0; }

.cardsWrapper { width: 100%; overflow: hidden; }

.scroller {
  display: flex; gap: 24px;
  overflow-x: auto; scroll-behavior: smooth;
  padding: 6px 8px 10px 8px;
  scrollbar-width: none; -ms-overflow-style: none;
}
.scroller::-webkit-scrollbar { display: none; }

.excursionCard {
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 300px; max-width: 300px; height: 400px;
  display: flex; flex-direction: column;
}
.excursionCard:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }

.excursionCardImg { height: 180px; background-size: cover; background-position: center; position: relative; background-color: #f0f0f0; }
.excursionTag {
  position: absolute; top: 16px; left: 16px;
  padding: 6px 12px; background: #FF6B00; color: #fff;
  font-size: 12px; font-weight: 500; border-radius: 16px; z-index: 5;
}

.excursionCardContent { padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.excursionCardRating { font-size: 12px; color: #666; margin-bottom: 4px; }
.excursionCardTitle { font-size: 18px; font-weight: 500; color: #212121; margin: 0 0 8px 0; line-height: 1.3; min-height: 54px; }
.excursionCardMeta { display: flex; gap: 12px; font-size: 13px; color: #666; margin-bottom: 16px; }
.excursionCardPrice { font-size: 20px; font-weight: 700; color: #212121; margin-bottom: 16px; }

.excursionBookBtn {
  width: 100%; padding: 12px; border: none; border-radius: 8px;
  background: #0055FB; color: #fff; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.2s, transform 0.1s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.excursionBookBtn:hover { background: #0044CC; }
.excursionBookBtn:active { transform: scale(0.98); }

/* Календарь */
.calendar { position: relative; width: 100%; max-width: 1400px; margin: 0 auto; padding: 16px 24px; overflow: hidden; border-bottom: 1px solid #f0f0f0; }
.calendarArrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px; border: none; background: none;
  font-size: 20px; color: #666; cursor: pointer; z-index: 10;
  display: flex; align-items: center; justify-content: center; transition: opacity 0.2s;
}
.calendarArrow:disabled { opacity: 0.3; cursor: default; }
.calendarArrowLeft { left: 8px; }
.calendarArrowRight { right: 8px; }

.calendarScroller {
  display: flex; gap: 16px; overflow-x: auto; scroll-behavior: smooth;
  padding: 0 26px;
  scrollbar-width: none; -ms-overflow-style: none;
}
.calendarScroller::-webkit-scrollbar { display: none; }

.dayItem { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 36px; cursor: pointer; user-select: none; }
.dayWeekday { font-size: 10px; font-weight: 400; color: #666; }
.weekend { color: #E52E2E; }
.dayNumber { font-size: 14px; font-weight: 500; color: #000; }
.past { color: #999; }
.active { color: #0055FB; font-weight: 700; }

/* Категории */
.categories { max-width: 1400px; margin: 0 auto; padding: 24px; }
.categoryBlock { margin-bottom: 64px; position: relative; }
.categoryHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 8px; }
.categoryTitle { font-size: 22px; font-weight: 500; color: #212121; margin: 0; }
.categoryAllLink { font-size: 14px; font-weight: 500; color: #0055FB; text-decoration: none; transition: opacity 0.2s; }
.categoryAllLink:hover { opacity: 0.8; }

@media (max-width: 1024px) { .excursionCard { min-width: 260px; max-width: 260px; } }
@media (max-width: 768px) { .excursionCard { min-width: 240px; max-width: 240px; } }
@media (max-width: 480px) { .excursionCard { min-width: 220px; max-width: 220px; } }
'@

# -------------------------
# Carousel (client)
# -------------------------
WriteFile "app\_components\CarouselBlock.tsx" @'
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../home.module.css";

export type ExcursionCardData = {
  tag: string;
  rating: string;
  title: string;
  duration: string;
  price: string;
  imageUrl: string;
};

function getVisibleCardsCount() {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth >= 1400) return 4;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

export default function CarouselBlock(props: {
  title?: string;
  subtitle?: string;
  id?: string;
  cards: ExcursionCardData[];
}) {
  const { title, subtitle, id, cards } = props;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft < max - 2);
  };

  useEffect(() => {
    update();
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const step = 324 * getVisibleCardsCount();

  return (
    <div className={styles.blockContainer} id={id}>
      {(title || subtitle) ? (
        <div className={styles.blockHeader}>
          {title ? <h2 className={styles.blockTitle}>{title}</h2> : null}
          {subtitle ? <p className={styles.blockSubtitle}>{subtitle}</p> : null}
        </div>
      ) : null}

      <button
        className={[styles.arrow, styles.arrowLeft].join(" ")}
        onClick={() => scrollerRef.current?.scrollBy({ left: -step, behavior: "smooth" })}
        disabled={!canLeft}
        aria-label="Назад"
      >
        ←
      </button>

      <button
        className={[styles.arrow, styles.arrowRight].join(" ")}
        onClick={() => scrollerRef.current?.scrollBy({ left: step, behavior: "smooth" })}
        disabled={!canRight}
        aria-label="Вперёд"
      >
        →
      </button>

      <div className={styles.cardsWrapper}>
        <div ref={scrollerRef} className={styles.scroller} onScroll={update}>
          {cards.map((c) => (
            <article key={c.title} className={styles.excursionCard}>
              <div
                className={styles.excursionCardImg}
                style={{ backgroundImage: `url(${c.imageUrl})` }}
              >
                <span className={styles.excursionTag}>{c.tag}</span>
              </div>

              <div className={styles.excursionCardContent}>
                <div>
                  <div className={styles.excursionCardRating}>⭐ {c.rating}</div>
                  <h3 className={styles.excursionCardTitle}>{c.title}</h3>
                  <div className={styles.excursionCardMeta}><span>{c.duration}</span></div>
                  <div className={styles.excursionCardPrice}>{c.price}</div>
                </div>

                <button className={styles.excursionBookBtn}>Купить билет →</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
'@

# -------------------------
# Calendar (client)
# -------------------------
WriteFile "app\_components\CalendarStrip.tsx" @'
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../home.module.css";

function isWeekend(d: Date) {
  const wd = d.getDay();
  return wd === 0 || wd === 6;
}

function keyOf(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarStrip() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeKey, setActiveKey] = useState(() => keyOf(new Date()));
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const days = useMemo(() => {
    const res: Date[] = [];
    const start = new Date();
    start.setHours(0,0,0,0);
    for (let i = -3; i < 28; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      res.push(d);
    }
    return res;
  }, []);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0,0,0,0);
    return t.getTime();
  }, []);

  const update = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft < max - 2);
  };

  useEffect(() => {
    update();
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const step = 300;

  return (
    <div className={styles.calendar}>
      <button
        className={[styles.calendarArrow, styles.calendarArrowLeft].join(" ")}
        onClick={() => scrollerRef.current?.scrollBy({ left: -step, behavior: "smooth" })}
        disabled={!canLeft}
      >
        ←
      </button>

      <button
        className={[styles.calendarArrow, styles.calendarArrowRight].join(" ")}
        onClick={() => scrollerRef.current?.scrollBy({ left: step, behavior: "smooth" })}
        disabled={!canRight}
      >
        →
      </button>

      <div ref={scrollerRef} className={styles.calendarScroller} onScroll={update}>
        {days.map((d) => {
          const k = keyOf(d);
          const past = d.getTime() < today;
          const active = k === activeKey;
          const wd = d.toLocaleDateString("ru-RU", { weekday: "short" });
          return (
            <div key={k} className={styles.dayItem} onClick={() => setActiveKey(k)}>
              <div className={[styles.dayWeekday, isWeekend(d) ? styles.weekend : ""].join(" ").trim()}>
                {wd}
              </div>
              <div className={[styles.dayNumber, past ? styles.past : "", active ? styles.active : ""].join(" ").trim()}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
'@

# -------------------------
# app/page.tsx
# -------------------------
WriteFile "app\page.tsx" @'
import Link from "next/link";
import styles from "./home.module.css";
import CalendarStrip from "./_components/CalendarStrip";
import CarouselBlock, { type ExcursionCardData } from "./_components/CarouselBlock";

const topSales: ExcursionCardData[] = [
  { tag: "Хит", rating: "4.97", title: "Закат с живой музыкой по центральным каналам", duration: "2 часа", price: "2 990 ₽", imageUrl: "https://picsum.photos/id/1050/600/400" },
  { tag: "Хит", rating: "4.90", title: "Закатное круиз по Неве", duration: "2 часа", price: "3 500 ₽", imageUrl: "https://picsum.photos/id/1068/600/400" },
  { tag: "Хит", rating: "5.00", title: "Ночной круиз по каналам с ужинами", duration: "3 часа", price: "3 500 ₽", imageUrl: "https://picsum.photos/id/1036/600/400" },
  { tag: "Хит", rating: "4.70", title: "Прогулка по Неве до Финского залива", duration: "2.5 часа", price: "3 000 ₽", imageUrl: "https://picsum.photos/id/1061/600/400" },
];

const riversAndCanals: ExcursionCardData[] = [
  { tag: "Вечеринка", rating: "5.00", title: "Ночной круиз по каналам с ужинами", duration: "3 часа", price: "3 500 ₽", imageUrl: "https://picsum.photos/id/1036/600/400" },
  { tag: "Исторический", rating: "4.90", title: "Экскурсия по каналам с гидом-историком", duration: "2.5 часа", price: "3 000 ₽", imageUrl: "https://picsum.photos/id/1039/600/400" },
  { tag: "Фотосессия", rating: "4.80", title: "Прогулка по каналам для фотографов", duration: "2 часа", price: "3 500 ₽", imageUrl: "https://picsum.photos/id/1043/600/400" },
  { tag: "Детский", rating: "4.90", title: "Детская экскурсия по каналам с мастер-классом", duration: "1.5 часа", price: "2 200 ₽", imageUrl: "https://picsum.photos/id/1048/600/400" },
];

const nevaAndGulf: ExcursionCardData[] = [
  { tag: "Прогулка", rating: "4.70", title: "Прогулка по Неве до Финского залива", duration: "2.5 часа", price: "3 000 ₽", imageUrl: "https://picsum.photos/id/1061/600/400" },
  { tag: "Закат", rating: "4.90", title: "Закатное круиз по Неве", duration: "2 часа", price: "3 500 ₽", imageUrl: "https://picsum.photos/id/1068/600/400" },
  { tag: "Музыка", rating: "4.90", title: "Круиз по Неве с концертом музыки", duration: "2.5 часа", price: "3 800 ₽", imageUrl: "https://picsum.photos/id/1074/600/400" },
  { tag: "Вино", rating: "4.80", title: "Круиз по Неве с винотекой", duration: "3 часа", price: "4 800 ₽", imageUrl: "https://picsum.photos/id/1071/600/400" },
];

export default function Page() {
  return (
    <main>
      <section className={styles.topSalesBlock}>
        <CarouselBlock id="top-sales" title="Хиты продаж" subtitle="Билеты раскупают за 48 часов" cards={topSales} />
      </section>

      <CalendarStrip />

      <section className={styles.categories}>
        <div className={styles.categoryBlock}>
          <div className={styles.categoryHeader}>
            <h2 className={styles.categoryTitle}>Реки и каналы</h2>
            <Link className={styles.categoryAllLink} href="/events">Посмотреть все →</Link>
          </div>
          <CarouselBlock cards={riversAndCanals} />
        </div>

        <div className={styles.categoryBlock}>
          <div className={styles.categoryHeader}>
            <h2 className={styles.categoryTitle}>Нева и Финский залив</h2>
            <Link className={styles.categoryAllLink} href="/events">Посмотреть все →</Link>
          </div>
          <CarouselBlock cards={nevaAndGulf} />
        </div>
      </section>
    </main>
  );
}
'@

Write-Host ""
Write-Host "✅ Готово. Файлы перезаписаны (UTF-8)."
Write-Host "▶ Далее: npm run dev"
Write-Host ""
