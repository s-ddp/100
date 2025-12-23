import Link from "next/link";
import styles from "./TopSales.module.css";

export default function TopSales() {
  const items = [
    {
      img: "https://picsum.photos/id/1050/600/400",
      title: "Закат с живой музыкой по центральным каналам",
      time: "2 часа",
      price: "2 990 ₽",
      slug: "sunset-live-music",
      group: "reki-i-kanaly",
    },
    {
      img: "https://picsum.photos/id/1068/600/400",
      title: "Закатный круиз по Неве",
      time: "2 часа",
      price: "3 500 ₽",
      slug: "sunset-neva",
      group: "neva-i-zaliv",
    },
    {
      img: "https://picsum.photos/id/1036/600/400",
      title: "Ночной круиз по каналам с ужином",
      time: "3 часа",
      price: "3 500 ₽",
      slug: "night-canal-dinner",
      group: "reki-i-kanaly",
    },
  ];

  return (
    <section className={styles.topSales}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Хиты продаж</h2>
          <p>Билеты раскупают за 48 часов</p>
        </div>

        <div className={styles.row}>
          {items.map((item) => (
            <Card key={item.slug} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({
  img,
  title,
  time,
  price,
  slug,
  group,
}: {
  img: string;
  title: string;
  time: string;
  price: string;
  slug?: string;
  group?: string;
}) {
  return (
    <div className={styles.card}>
      <div
        className={styles.image}
        style={{ backgroundImage: `url(${img})` }}
      >
        <span className={styles.tag}>Хит</span>
      </div>

      <div className={styles.content}>
        <h3>{title}</h3>
        <div className={styles.meta}>{time}</div>
        <div className={styles.price}>{price}</div>
        {slug && group ? (
          <Link
            href={`/excursions/${group}/${slug}`}
            className={styles.buyButton}
          >
            Купить билет →
          </Link>
        ) : (
          <button className={styles.buyButton}>
            Купить билет →
          </button>
        )}
      </div>
    </div>
  );
}
