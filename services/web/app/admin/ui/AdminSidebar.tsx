"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.css";

const sections = [
  {
    title: "Управление системой",
    items: [
      { href: "/admin/users", label: "Управление доступом" },
      { href: "/admin/settings", label: "Настройки" },
      { href: "/admin/translations", label: "Переводы" },
    ],
  },
  {
    title: "Содержание сайта",
    items: [
      { href: "/admin/content/pages", label: "Страницы" },
      { href: "/admin/content/news", label: "Новости" },
      { href: "/admin/content/navigation", label: "Навигация" },
    ],
  },
  {
    title: "Интернет-магазин",
    items: [
      { href: "/admin/shop/orders", label: "Заказы" },
      { href: "/admin/shop/clients", label: "Клиенты" },
      { href: "/admin/shop/finance", label: "Финансы" },
    ],
  },
  {
    title: "Работа с поставщиками",
    items: [
      { href: "/admin/suppliers/list", label: "Поставщики" },
      { href: "/admin/suppliers/settlements", label: "Расчёты с поставщиками" },
    ],
  },
  {
    title: "Отчетность",
    items: [{ href: "/admin/reports", label: "Отчеты" }],
  },
  {
    title: "Справочники",
    items: [{ href: "/admin/dictionaries", label: "Справочники" }],
  },
  {
    title: "Аренда",
    items: [
      { href: "/admin/rent/boats", label: "Судна для аренды" },
      { href: "/admin/rent/boat", label: "Судно" },
      { href: "/admin/rent/parameters", label: "Параметры судов" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {sections.map((section) => (
        <div key={section.title} className={styles.section}>
          <div className={styles.sectionTitle}>{section.title}</div>
          <nav className={styles.nav}>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? styles.navLinkActive : styles.navLink}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
