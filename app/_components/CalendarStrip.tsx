@'
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../home.module.css";

type Day = { month: string; weekday: string; number: number; weekend?: boolean; past?: boolean };

export default function CalendarStrip() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<number>(1);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const data = useMemo(() => {
    return [
      {
        month: "ноябрь",
        days: [
          { month: "ноябрь", weekday: "пт", number: 28, past: true },
          { month: "ноябрь", weekday: "сб", number: 29, past: true, weekend: true },
          { month: "ноябрь", weekday: "вс", number: 30, past: true, weekend: true },
        ] as Day[],
      },
      {
        month: "декабрь",
        days: [
          { month: "декабрь", weekday: "пн", number: 1 },
          { month: "декабрь", weekday: "вт", number: 2 },
          { month: "декабрь", weekday: "ср", number: 3 },
          { month: "декабрь", weekday: "чт", number: 4 },
          { month: "декабрь", weekday: "пт", number: 5 },
          { month: "декабрь", weekday: "сб", number: 6, weekend: true },
          { month: "декабрь", weekday: "вс", number: 7, weekend: true },
          { month: "декабрь", weekday: "пн", number: 8 },
          { month: "декабрь", weekday: "вт", number: 9 },
          { month: "декабрь", weekday: "ср", number: 10 },
          { month: "декабрь", weekday: "чт", number: 11 },
          { month: "декабрь", weekday: "пт", number: 12 },
          { month: "декабрь", weekday: "сб", number: 13, weekend: true },
        ] as Day[],
      },
    ];
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
        disabled={!canLeft}
        onClick={() => scrollerRef.current?.scrollBy({ left: -step, behavior: "smooth" })}
      >
        ←
      </button>

      <button
        className={[styles.calendarArrow, styles.calendarArrowRight].join(" ")}
        disabled={!canRight}
        onClick={() => scrollerRef.current?.scrollBy({ left: step, behavior: "smooth" })}
      >
        →
      </button>

      <div ref={scrollerRef} className={styles.calendarScroller} onScroll={update}>
        {data.map((m) => (
          <div key={m.month} className={styles.monthGroup}>
            <div className={styles.monthTitle}>{m.month}</div>
            <div className={styles.daysRow}>
              {m.days.map((d) => (
                <div key={`${m.month}-${d.number}`} className={styles.dayItem} onClick={() => setActive(d.number)}>
                  <div className={[styles.dayWeekday, d.weekend ? styles.weekend : ""].join(" ").trim()}>
                    {d.weekday}
                  </div>
                  <div
                    className={[
                      styles.dayNumber,
                      d.past ? styles.past : "",
                      active === d.number ? styles.active : "",
                    ].join(" ").trim()}
                  >
                    {d.number}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding utf8 "app\_components\CalendarStrip.tsx"
