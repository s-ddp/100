"use client";

import { useMemo, useState } from "react";
import styles from "../../Excursion.module.css";

type EventData = {
  title: string;
  description: string;
  duration: string;
  price: string;
  images: string[];
  dates: string[];
  route: string;
  pier: string;
};

const eventsByGroup: Record<string, Record<string, EventData>> = {
  "reki-i-kanaly": {
    "sunset-live-music": {
      title: "Закат с живой музыкой по каналам",
      description:
        "Маршрут по центральным каналам с лайв-музыкой на борту, приветственным напитком и видом на белые ночи.",
      duration: "2 часа",
      price: "от 2 990 ₽",
      images: [
        "https://images.unsplash.com/photo-1599498774876-3adeb03c30ed?w=1600",
        "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600",
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600",
      ],
      dates: ["Сегодня, 19:00", "Сегодня, 21:00", "Завтра, 19:30"],
      route:
        "https://images.unsplash.com/photo-1528281408336-560a97e338dd?w=1200",
      pier: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
    },
  },
  "neva-i-zaliv": {},
};

export default function ExcursionPage({
  params,
}: {
  params: { group: string; slug: string };
}) {
  const event = eventsByGroup[params.group]?.[params.slug];
  const [activeImage, setActiveImage] = useState(event?.images?.[0] ?? "");
  const [selectedDate, setSelectedDate] = useState(event?.dates?.[0] ?? "");
  const [scheme, setScheme] = useState<"route" | "pier">("route");

  const schemeImage = useMemo(() => {
    if (!event) return "";
    return scheme === "route" ? event.route : event.pier;
  }, [event, scheme]);

  if (!event) {
    return (
      <main className={styles.container}>
        <h1>Экскурсия не найдена</h1>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.breadcrumbs}>
        <a href="/">Главная</a> →{" "}
        <a href={`/excursions/${params.group}`}>Экскурсии</a> → {event.title}
      </div>

      <div className={styles.hero}>
        <div
          className={styles.heroPhoto}
          style={{ backgroundImage: `url(${activeImage})` }}
        />

        <div className={styles.details}>
          <span className={styles.label}>Экскурсия</span>
          <h1>{event.title}</h1>
          <p className={styles.desc}>{event.description}</p>

          <div className={styles.meta}>
            <span>{event.duration}</span>
            <span>{event.price}</span>
          </div>

          <div className={styles.dates}>
            {event.dates.map((date) => (
              <button
                key={date}
                className={
                  selectedDate === date ? styles.dateActive : styles.date
                }
                onClick={() => setSelectedDate(date)}
              >
                {date}
              </button>
            ))}
          </div>

          <button className={styles.cta}>
            Выбрать {selectedDate || "дату"}
          </button>
        </div>
      </div>

      <div className={styles.gallery}>
        {event.images.map((img) => (
          <button
            key={img}
            className={activeImage === img ? styles.thumbActive : styles.thumb}
            style={{ backgroundImage: `url(${img})` }}
            onClick={() => setActiveImage(img)}
            aria-label="Показать фото"
          />
        ))}
      </div>

      <div className={styles.scheme}>
        <div className={styles.schemeToggle}>
          <button
            className={scheme === "route" ? styles.schemeButtonActive : ""}
            onClick={() => setScheme("route")}
          >
            Схема маршрута
          </button>
          <button
            className={scheme === "pier" ? styles.schemeButtonActive : ""}
            onClick={() => setScheme("pier")}
          >
            Схема причала
          </button>
        </div>

        <div
          className={styles.schemeImg}
          style={{ backgroundImage: `url(${schemeImage})` }}
        />
      </div>
    </main>
  );
}
