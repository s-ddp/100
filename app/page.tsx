import styles from "./home-legacy.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <h1 className={styles.h1}>Билеты на водные экскурсии</h1>
            <p className={styles.sub}>
              Лучшие водные экскурсии и прогулки по Санкт-Петербургу и окрестностям.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionTitleRow}>
              <h2 className={styles.h2}>Популярные экскурсии</h2>
              <a className={styles.allLink} href="/events">
                Смотреть все →
              </a>
            </div>

            <div className={styles.cardsGrid}>
              <article className={styles.card}>
                <div className={styles.cardImage} />
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>
                    Метеор: Кронштадт → Петергоф
                  </div>
                  <div className={styles.cardDesc}>
                    Скоростная прогулка по воде, лучшие виды.
                  </div>

                  <div className={styles.cardMeta}>
                    <span className={styles.badge}>1ч 10м</span>
                    <span className={styles.price}>от 1 900 ₽</span>
                  </div>

                  <div className={styles.cardActions}>
                    <a className={styles.primaryBtn} href="/events">
                      Купить билет
                    </a>
                    <a className={styles.secondaryBtn} href="/events">
                      Подробнее
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
