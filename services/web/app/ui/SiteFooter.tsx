import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerColumn}>
            <h3>AquaVoyage</h3>
            <p className={styles.footerText}>
              Лучшие водные экскурсии и круизы по Петербургу и окрестностям
            </p>
            <div className={styles.footerSocials}>
              <a href="#" className={styles.footerSocialLink} aria-label="VK"><i className="fab fa-vk" /></a>
              <a href="#" className={styles.footerSocialLink} aria-label="Instagram"><i className="fab fa-instagram" /></a>
              <a href="#" className={styles.footerSocialLink} aria-label="Telegram"><i className="fab fa-telegram" /></a>
              <a href="#" className={styles.footerSocialLink} aria-label="WhatsApp"><i className="fab fa-whatsapp" /></a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3>Навигация</h3>
            <ul>
              <li><a href="/">Главная</a></li>
              <li><a href="#top-sales">Хиты продаж</a></li>
              <li><a href="/events">Все экскурсии</a></li>
              <li><a href="/about">О нас</a></li>
              <li><a href="/contacts">Контакты</a></li>
              <li><a href="/faq">FAQ</a></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3>Контакты</h3>
            <div className={styles.footerContactItem}><i className="fas fa-map-marker-alt" /><span>Санкт-Петербург, Причал №5</span></div>
            <div className={styles.footerContactItem}><i className="fas fa-phone" /><span>+7 (812) 123-45-67</span></div>
            <div className={styles.footerContactItem}><i className="fas fa-envelope" /><span>info@aquavoyage.ru</span></div>
            <div className={styles.footerContactItem}><i className="fas fa-clock" /><span>Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00</span></div>
          </div>

          <div className={styles.footerColumn}>
            <h3>Полезное</h3>
            <ul>
              <li><a href="/rules">Правила покупки билетов</a></li>
              <li><a href="/privacy">Политика конфиденциальности</a></li>
              <li><a href="/payments">Оплата и возврат</a></li>
              <li><a href="/promo">Акции и скидки</a></li>
              <li><a href="/certificates">Подарочные сертификаты</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerCopyright}>
          © {new Date().getFullYear()} AquaVoyage. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
