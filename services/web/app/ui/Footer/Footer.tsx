import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div>
            <h3>AquaVoyage</h3>
            <p>Лучшие водные экскурсии и аренда судов по Санкт-Петербургу</p>
          </div>

          <div>
            <h3>Навигация</h3>
            <a href="/">Главная</a>
            <a href="/rent">Аренда</a>
            <a href="/help">Помощь</a>
          </div>

          <div>
            <h3>Контакты</h3>
            <div>+7 (812) 123-45-67</div>
            <div>info@aquavoyage.ru</div>
            <div>Причал №5</div>
          </div>
        </div>

        <div className={styles.copy}>
          © 2025 AquaVoyage. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
