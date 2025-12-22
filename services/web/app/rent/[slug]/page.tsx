"use client";

import { useState } from "react";
import styles from "./BoatPage.module.css";

const boats: Record<
  string,
  {
    title: string;
    type: string;
    capacity: string;
    speed: string;
    images: string[];
    prices: { id: string; label: string; price: string }[];
    description: string;
  }
> = {
  albatros: {
    title: 'Моторная яхта "Альбатрос"',
    type: "Моторная яхта",
    capacity: "12 человек",
    speed: "35 км/ч",
    images: [
      "https://images.unsplash.com/photo-1524008757925-5024e639526e?w=1600",
      "https://images.unsplash.com/photo-1517984033328-110d6e870561?w=1600",
      "https://images.unsplash.com/photo-1552941776-991e5279a050?w=1600",
    ],
    prices: [
      { id: "1h", label: "1 час", price: "15 000 ₽" },
      { id: "4h", label: "4 часа", price: "50 000 ₽" },
      { id: "day", label: "На день", price: "90 000 ₽" },
    ],
    description:
      "Современная двухпалубная моторная яхта класса люкс для прогулок по Неве и каналам.",
  },
  briz: {
    title: 'Катер "Бриз"',
    type: "Катер",
    capacity: "6 человек",
    speed: "25 км/ч",
    images: [
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600",
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600",
    ],
    prices: [
      { id: "1h", label: "1 час", price: "5 000 ₽" },
      { id: "3h", label: "3 часа", price: "13 000 ₽" },
      { id: "day", label: "На день", price: "30 000 ₽" },
    ],
    description:
      "Комфортный катер для небольших компаний: прогулки, фотосессии и трансферы по воде.",
  },
};

export default function Boat({ params }: { params: { slug: string } }) {
  const boat = boats[params.slug];
  const [activeImg, setActiveImg] = useState(boat?.images?.[0] ?? "");
  const [modal, setModal] = useState(false);

  if (!boat) {
    return (
      <main className={styles.container}>
        <h1>Судно не найдено</h1>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.breadcrumbs}>
        <a href="/">Главная</a> → <a href="/rent">Аренда</a> → {boat.title}
      </div>

      <div
        className={styles.mainPhoto}
        style={{ backgroundImage: `url(${activeImg})` }}
      />

      <div className={styles.gallery}>
        {boat.images.map((img) => (
          <div
            key={img}
            className={styles.thumb}
            style={{ backgroundImage: `url(${img})` }}
            onClick={() => setActiveImg(img)}
          />
        ))}
      </div>

      <div className={styles.infoGrid}>
        <div>
          <h1>{boat.title}</h1>
          <span className={styles.type}>{boat.type}</span>

          <ul className={styles.meta}>
            <li>{boat.capacity}</li>
            <li>{boat.speed}</li>
            <li>Капитан включён</li>
          </ul>

          <p className={styles.description}>{boat.description}</p>
        </div>

        <div className={styles.pricing}>
          <h3>Стоимость аренды</h3>
          {boat.prices.map((p) => (
            <div key={p.id} className={styles.priceRow}>
              <span>{p.label}</span>
              <strong>{p.price}</strong>
            </div>
          ))}
          <button onClick={() => setModal(true)}>Оставить заявку</button>
        </div>
      </div>

      {modal && (
        <div className={styles.modal} onClick={() => setModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Заявка на аренду</h2>
            <input placeholder="ФИО" />
            <input placeholder="Телефон" />
            <button>Отправить</button>
          </div>
        </div>
      )}
    </main>
  );
}
