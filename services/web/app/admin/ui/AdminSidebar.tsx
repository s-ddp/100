"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type MenuGroup = {
  id: string;
  title: string;
  items: { label: string; href: string }[];
};

const MENU: MenuGroup[] = [
  {
    id: "rent",
    title: "Аренда",
    items: [
      { label: "Суда", href: "/admin/boats" },
      { label: "Судно для аренды", href: "/admin/rent/boats" },
      { label: "Параметры", href: "/admin/rent/parameters" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string>("rent");

  // при смене страницы — раскрываем нужную группу
  useEffect(() => {
    setOpenGroup("rent");
  }, [pathname]);

  return (
    <aside style={sidebar}>
      <div style={logo}>Admin</div>

      {MENU.map((group) => {
        const opened = openGroup === group.id;

        return (
          <div key={group.id}>
            <button
              onClick={() => setOpenGroup(opened ? "" : group.id)}
              style={groupBtn}
            >
              {group.title}
              <span style={{ opacity: 0.6 }}>{opened ? "▾" : "▸"}</span>
            </button>

            {opened &&
              group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      ...itemStyle,
                      background: active ? "#2a2f3a" : undefined,
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </div>
        );
      })}
    </aside>
  );
}

/* ===== styles ===== */

const sidebar: React.CSSProperties = {
  width: 240,
  minHeight: "100vh",
  background: "#1b1f2a",
  color: "#fff",
  padding: 8,
};

const logo: React.CSSProperties = {
  fontWeight: 900,
  padding: 12,
};

const groupBtn: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  color: "#fff",
  padding: "10px 12px",
  fontWeight: 700,
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
};

const itemStyle: React.CSSProperties = {
  display: "block",
  padding: "8px 24px",
  color: "#fff",
  textDecoration: "none",
  fontSize: 14,
};
