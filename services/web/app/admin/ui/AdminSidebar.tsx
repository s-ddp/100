"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const MENU = [
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
  const [open, setOpen] = useState<string>("rent");

  useEffect(() => {
    setOpen("rent");
  }, [pathname]);

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
    <aside style={sidebar}>
      <h3 style={{ padding: 12 }}>Admin</h3>
      {MENU.map((g) => (
        <div key={g.id}>
          <div onClick={() => setOpen(g.id)} style={group}>
            {g.title}
          </div>
          {open === g.id &&
            g.items.map((i) => (
              <Link key={i.href} href={i.href} style={{
                ...item,
                background: pathname?.startsWith(i.href) ? "#2a2f3a" : undefined,
              }}>
                {i.label}
              </Link>
            ))}
        </div>
      ))}
    </aside>
  );
}

const sidebar: React.CSSProperties = {
  width: 240,
  background: "#1b1f2a",
  color: "#fff",
  minHeight: "100vh",
};

const group: React.CSSProperties = {
  padding: 12,
  cursor: "pointer",
  fontWeight: 700,
};

const item: React.CSSProperties = {
  display: "block",
  padding: "8px 24px",
  color: "#fff",
  textDecoration: "none",
};
