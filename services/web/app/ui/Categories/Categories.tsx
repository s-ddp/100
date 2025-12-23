import Link from "next/link";
import styles from "./Categories.module.css";

export default function Categories() {
  return (
    <section className={styles.categories}>
      <CategoryBlock
        title="Реки и каналы"
        groupSlug="reki-i-kanaly"
        cards={[
          {
            img: "https://picsum.photos/id/1036/600/400",
            tag: "Вечеринка",
            title: "Ночной круиз по каналам с ужинами",
            time: "3 часа",
            price: "3 500 ₽",
            slug: "night-canal-dinner",
          },
          {
            img: "https://picsum.photos/id/1039/600/400",
            tag: "Исторический",
            title: "Экскурсия по каналам с гидом-историком",
            time: "2.5 часа",
            price: "3 000 ₽",
            slug: "history-guide-tour",
          },
          {
            img: "https://picsum.photos/id/1043/600/400",
            tag: "Фотосессия",
            title: "Прогулка по каналам для фотографов",
            time: "2 часа",
            price: "3 500 ₽",
            slug: "photo-walk-canals",
          },
        ]}
      />

      <CategoryBlock
        title="Нева и Финский залив"
        groupSlug="neva-i-zaliv"
        cards={[
          {
            img: "https://picsum.photos/id/1061/600/400",
            tag: "Прогулка",
            title: "Прогулка по Неве до Финского залива",
            time: "2.5 часа",
            price: "3 000 ₽",
            slug: "neva-gulf-route",
          },
          {
            img: "https://picsum.photos/id/1068/600/400",
            tag: "Закат",
            title: "Закатный круиз по Неве",
            time: "2 часа",
            price: "3 500 ₽",
            slug: "sunset-live-music",
          },
          {
            img: "https://picsum.photos/id/1071/600/400",
            tag: "Вино",
            title: "Круиз по Неве с винотекой",
            time: "3 часа",
            price: "4 800 ₽",
            slug: "wine-cruise-neva",
          },
        ]}
      />
    </section>
  );
}

function CategoryBlock({
  title,
  cards,
  groupSlug,
}: {
  title: string;
  cards: {
    img: string;
    tag: string;
    title: string;
    time: string;
    price: string;
    slug: string;
  }[];
  groupSlug: string;
}) {
  return (
    <div className={styles.categoryBlock}>
      <div className={styles.categoryHeader}>
        <h2 className={styles.categoryTitle}>{title}</h2>
        <Link href={`/excursions/${groupSlug}`} className={styles.categoryAll}>
          Посмотреть все →
        </Link>
      </div>

      <div className={styles.cardsRow}>
        {cards.map((card, i) => (
          <CategoryCard key={i} {...card} groupSlug={groupSlug} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({
  img,
  tag,
  title,
  time,
  price,
  slug,
  groupSlug,
}: {
  img: string;
  tag: string;
  title: string;
  time: string;
  price: string;
  slug: string;
  groupSlug: string;
}) {
  return (
    <Link href={`/excursions/${groupSlug}/${slug}`} className={styles.card}>
      <div
        className={styles.image}
        style={{ backgroundImage: `url(${img})` }}
      >
        <span className={styles.tag}>{tag}</span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <div className={styles.meta}>{time}</div>
        <div className={styles.price}>{price}</div>
        <span className={styles.buyButton}>
          Купить билет →
        </span>
      </div>
    </Link>
  );
}
