import Link from "next/link";
import styles from "./Rent.module.css";

const boats = [
  {
    slug: "albatros",
    title: 'Яхта "Альбатрос"',
    capacity: "12 человек",
    price: "15 000 ₽ / час",
  },
  {
    slug: "briz",
    title: 'Катер "Бриз"',
    capacity: "6 человек",
    price: "5 000 ₽ / час",
  },
];

export default function Rent() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Аренда судов</h1>
        <p>Выберите катер, яхту или гидроцикл</p>
      </header>

      <section className={styles.filters}>
        <div>
          <label>Город</label>
          <select>
            <option>Все города</option>
            <option>Санкт-Петербург</option>
            <option>Кронштадт</option>
            <option>Петергоф</option>
          </select>
        </div>

        <div>
          <label>Тип судна</label>
          <select>
            <option>Все</option>
            <option>Катер</option>
            <option>Яхта</option>
            <option>Гидроцикл</option>
          </select>
        </div>

        <div>
          <label>Макс. человек</label>
          <input type="range" />
        </div>

        <div>
          <label>Цена</label>
          <input type="range" />
        </div>
      </section>

      <section className={styles.grid}>
        {boats.map((boat) => (
          <article key={boat.slug} className={styles.card}>
            <div className={styles.image} />
            <h3>{boat.title}</h3>
            <p>{boat.capacity}</p>
            <strong>{boat.price}</strong>
            <Link href={`/rent/${boat.slug}`} className={styles.cardButton}>
              Арендовать →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
