@'
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../home.module.css";

export type CardItem = {
  imageUrl: string;
  tag: string;
  rating: string;
  title: string;
  duration: string;
  price: string;
};

function getVisibleCardsCount() {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth >= 1400) return 4;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

export default function CarouselBlock(props: {
  cards: CardItem[];
  title?: string;
  subtitle?: string;
  id?: string;
  containerClassName?: string;
}) {
  const { cards, title, subtitle, id, containerClassName } = props;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const step = useMemo(() => 324 * getVisibleCardsCount(), []);

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

  return (
    <div id={id} className={containerClassName}>
      {title || subtitle ? (
        <div className={styles.topSalesHeader}>
          {title ? <h2 className={styles.topSalesTitle}>{title}</h2> : null}
          {subtitle ? <p className={styles.topSalesSubtitle}>{subtitle}</p> : null}
        </div>
      ) : null}

      <button
        className={[styles.carouselArrow, styles.carouselArrowLeft].join(" ")}
        disabled={!canLeft}
        onClick={() => scrollerRef.current?.scrollBy({ left: -step, behavior: "smooth" })}
        aria-label="Назад"
      >
        ←
      </button>

      <button
        className={[styles.carouselArrow, styles.carouselArrowRight].join(" ")}
        disabled={!canRight}
        onClick={() => scrollerRef.current?.scrollBy({ left: step, behavior: "smooth" })}
        aria-label="Вперёд"
      >
        →
      </button>

      <div className={styles.excursionCardsWrapper}>
        <div ref={scrollerRef} className={styles.excursionCardsRow} onScroll={update}>
          {cards.map((c) => (
            <div key={c.title} className={styles.excursionCard}>
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
                  <div className={styles.excursionCardMeta}>
                    <span>{c.duration}</span>
                  </div>
                  <div className={styles.excursionCardPrice}>{c.price}</div>
                </div>

                <button className={styles.excursionBookBtn}>Купить билет →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content -Encoding utf8 "app\_components\CarouselBlock.tsx"
