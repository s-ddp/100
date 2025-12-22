import Link from "next/link";
import styles from "./Rent.module.css";

export default function RentPage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Аренда судов</h1>
        <p>Выберите катер, яхту или гидроцикл</p>
      </header>

      <section className={styles.filters}>
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
        <div className={styles.card}>
          <div className={styles.image} />
          <h3>Катер "Бриз"</h3>
          <p>6 человек</p>
          <strong>5 000 ₽ / час</strong>
          <Link href="/rent/albatros" className={styles.cardButton}>
            Арендовать →
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.image} />
          <h3>Яхта "Альбатрос"</h3>
          <p>12 человек</p>
          <strong>15 000 ₽ / час</strong>
          <Link href="/rent/albatros" className={styles.cardButton}>
            Арендовать →
          </Link>
        </div>
      </section>
    </main>
  );
}
