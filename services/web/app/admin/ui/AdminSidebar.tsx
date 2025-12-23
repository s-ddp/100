"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.css";

type NavItem = { label: string; href: string };
type NavGroup = { id: string; label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    id: "system",
    label: "Информация о системе",
    items: [{ label: "Пользователи", href: "/admin/users" }, { label: "Настройки", href: "/admin/settings" }],
  },
  {
    id: "rent",
    label: "Аренда",
    items: [
      { label: "Суда", href: "/admin/boats" },
      { label: "Судно для аренды", href: "/admin/rent/boats" },
      { label: "Параметры", href: "/admin/rent/parameters" },
    ],
  },
  {
    id: "orders",
    label: "Заказы",
    items: [{ label: "Список заказов", href: "/admin/orders" }],
  },
  {
    id: "dictionaries",
    label: "Справочники",
    items: [{ label: "Города", href: "/admin/dictionaries/cities" }, { label: "Переводы", href: "/admin/translations" }],
  },
  {
    id: "shop",
    label: "Интернет-магазин",
    items: [
      { label: "Клиенты", href: "/admin/shop/clients" },
      { label: "Финансы", href: "/admin/shop/finance" },
      { label: "Заказы (магазин)", href: "/admin/shop/orders" },
    ],
  },
  {
    id: "reports",
    label: "Отчёты",
    items: [{ label: "Отчёты", href: "/admin/reports" }],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const groupByPath = useMemo(() => {
    for (const g of GROUPS) {
      if (g.items.some((it) => pathname?.startsWith(it.href))) return g.id;
    }
    return "rent";
  }, [pathname]);

  const [openGroupId, setOpenGroupId] = useState<string>(groupByPath);

  // при переходе — открываем группу текущего раздела и закрываем предыдущую
  useEffect(() => {
    setOpenGroupId(groupByPath);
  }, [groupByPath]);

  function toggleGroup(id: string) {
    setOpenGroupId((prev) => (prev === id ? "" : id)); // одна открыта, остальные закрыты
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Admin</div>

      <nav className={styles.nav}>
        {GROUPS.map((g) => {
          const open = openGroupId === g.id;
          return (
            <div key={g.id} className={styles.group}>
              <button className={styles.groupHeader} onClick={() => toggleGroup(g.id)} aria-expanded={open}>
                <span className={styles.groupTitle}>{g.label}</span>
                <span className={`${styles.chev} ${open ? styles.chevOpen : ""}`}>▾</span>
              </button>

              <div className={`${styles.groupItems} ${open ? styles.groupItemsOpen : ""}`}>
                {g.items.map((it) => {
                  const active = pathname === it.href || (it.href !== "/admin" && pathname?.startsWith(it.href));
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={`${styles.item} ${active ? styles.itemActive : ""}`}
                    >
                      <span className={styles.bullet}>•</span>
                      <span>{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
