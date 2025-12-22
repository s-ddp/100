import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* О компании */}
          <div>
            <h3 className={styles.title}>AquaVoyage</h3>
            <p className={styles.text}>
              Лучшие водные экскурсии и круизы по Петербургу и окрестностям
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className={styles.title}>Навигация</h3>
            <ul className={styles.list}>
              <li><a href="#">Экскурсии</a></li>
              <li><a href="#">Аренда</a></li>
              <li><a href="#">Новости</a></li>
              <li><a href="#">Контакты</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className={styles.title}>Контакты</h3>
            <p className={styles.text}>Санкт-Петербург, Причал №5</p>
            <p className={styles.text}>+7 (812) 123-45-67</p>
            <p className={styles.text}>info@aquavoyage.ru</p>
          </div>

          {/* Полезное */}
          <div>
            <h3 className={styles.title}>Полезное</h3>
            <ul className={styles.list}>
              <li><a href="#">Правила покупки</a></li>
              <li><a href="#">Политика конфиденциальности</a></li>
              <li><a href="#">Оплата и возврат</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.copy}>
          © 2025 AquaVoyage. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
