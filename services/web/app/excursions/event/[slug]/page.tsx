"use client";

import { useMemo, useState } from "react";

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

const events: Record<string, EventData> = {
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
    route: "https://images.unsplash.com/photo-1528281408336-560a97e338dd?w=1200",
    pier: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
};

export default function ExcursionPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = events[params.slug];
  const [activeImage, setActiveImage] = useState(
    event?.images?.[0] ?? ""
  );
  const [selectedDate, setSelectedDate] = useState(event?.dates?.[0] ?? "");
  const [scheme, setScheme] = useState<"route" | "pier">("route");

  const schemeImage = useMemo(() => {
    if (!event) return "";
    return scheme === "route" ? event.route : event.pier;
  }, [event, scheme]);

  if (!event) {
    return (
      <main className="container excursion-event">
        <h1>Экскурсия не найдена</h1>
      </main>
    );
  }

  return (
    <main className="container excursion-event">
      <div className="excursion-breadcrumbs">
        <a href="/">Главная</a> → <a href="/excursions/reki-i-kanaly">Экскурсии</a>{" "}
        → {event.title}
      </div>

      <div className="excursion-hero">
        <div
          className="excursion-hero-photo"
          style={{ backgroundImage: `url(${activeImage})` }}
        />

        <div className="excursion-details">
          <span className="excursion-label">Экскурсия</span>
          <h1>{event.title}</h1>
          <p className="excursion-desc">{event.description}</p>

          <div className="excursion-meta">
            <span>{event.duration}</span>
            <span>{event.price}</span>
          </div>

          <div className="excursion-dates">
            {event.dates.map((date) => (
              <button
                key={date}
                className={
                  selectedDate === date
                    ? "excursion-date active"
                    : "excursion-date"
                }
                onClick={() => setSelectedDate(date)}
              >
                {date}
              </button>
            ))}
          </div>

          <button className="excursion-cta">
            Выбрать {selectedDate || "дату"}
          </button>
        </div>
      </div>

      <div className="excursion-gallery">
        {event.images.map((img) => (
          <button
            key={img}
            className={
              activeImage === img ? "excursion-thumb active" : "excursion-thumb"
            }
            style={{ backgroundImage: `url(${img})` }}
            onClick={() => setActiveImage(img)}
            aria-label="Показать фото"
          />
        ))}
      </div>

      <div className="excursion-scheme">
        <div className="excursion-scheme-toggle">
          <button
            className={scheme === "route" ? "active" : ""}
            onClick={() => setScheme("route")}
          >
            Схема маршрута
          </button>
          <button
            className={scheme === "pier" ? "active" : ""}
            onClick={() => setScheme("pier")}
          >
            Схема причала
          </button>
        </div>

        <div
          className="excursion-scheme-img"
          style={{ backgroundImage: `url(${schemeImage})` }}
        />
      </div>
    </main>
  );
}
