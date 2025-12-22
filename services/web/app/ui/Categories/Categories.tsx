import styles from "./Categories.module.css";

export default function Categories() {
  return (
    <section className={styles.categories}>
      <CategoryBlock
        title="Реки и каналы"
        cards={[
          {
            img: "https://picsum.photos/id/1036/600/400",
            tag: "Вечеринка",
            title: "Ночной круиз по каналам с ужинами",
            time: "3 часа",
            price: "3 500 ₽",
          },
          {
            img: "https://picsum.photos/id/1039/600/400",
            tag: "Исторический",
            title: "Экскурсия по каналам с гидом-историком",
            time: "2.5 часа",
            price: "3 000 ₽",
          },
          {
            img: "https://picsum.photos/id/1043/600/400",
            tag: "Фотосессия",
            title: "Прогулка по каналам для фотографов",
            time: "2 часа",
            price: "3 500 ₽",
          },
        ]}
      />

      <CategoryBlock
        title="Нева и Финский залив"
        cards={[
          {
            img: "https://picsum.photos/id/1061/600/400",
            tag: "Прогулка",
            title: "Прогулка по Неве до Финского залива",
            time: "2.5 часа",
            price: "3 000 ₽",
          },
          {
            img: "https://picsum.photos/id/1068/600/400",
            tag: "Закат",
            title: "Закатный круиз по Неве",
            time: "2 часа",
            price: "3 500 ₽",
          },
          {
            img: "https://picsum.photos/id/1071/600/400",
            tag: "Вино",
            title: "Круиз по Неве с винотекой",
            time: "3 часа",
            price: "4 800 ₽",
          },
        ]}
      />
    </section>
  );
}

function CategoryBlock({
  title,
  cards,
}: {
  title: string;
  cards: {
    img: string;
    tag: string;
    title: string;
    time: string;
    price: string;
  }[];
}) {
  return (
    <div className={styles.categoryBlock}>
      <div className={styles.categoryHeader}>
        <h2 className={styles.categoryTitle}>{title}</h2>
        <a href="#" className={styles.categoryAll}>
          Посмотреть все →
        </a>
      </div>

      <div className={styles.cardsRow}>
        {cards.map((card, i) => (
          <CategoryCard key={i} {...card} />
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
}: {
  img: string;
  tag: string;
  title: string;
  time: string;
  price: string;
}) {
  return (
    <div className={styles.card}>
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
        <button className={styles.buyButton}>
          Купить билет →
        </button>
      </div>
    </div>
  );
}
