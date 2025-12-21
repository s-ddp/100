@'
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3>AquaVoyage</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
              Лучшие водные экскурсии и круизы по Петербургу и окрестностям
            </p>

            <div className="footer-socials">
              <a href="#" className="footer-social-link" aria-label="VK">
                <i className="fab fa-vk" />
              </a>
              <a href="#" className="footer-social-link" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="#" className="footer-social-link" aria-label="Telegram">
                <i className="fab fa-telegram" />
              </a>
              <a href="#" className="footer-social-link" aria-label="WhatsApp">
                <i className="fab fa-whatsapp" />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Навигация</h3>
            <ul>
              <li><Link href="/">Главная</Link></li>
              <li><Link href="/#top-sales">Хиты продаж</Link></li>
              <li><Link href="/events">Все экскурсии</Link></li>
              <li><Link href="/about">О нас</Link></li>
              <li><Link href="/contacts">Контакты</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Контакты</h3>
            <div className="footer-contact-item">
              <i className="fas fa-map-marker-alt" />
              <span>Санкт-Петербург, Причал №5</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-phone" />
              <span>+7 (812) 123-45-67</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-envelope" />
              <span>info@aquavoyage.ru</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-clock" />
              <span>Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00</span>
            </div>
          </div>

          <div className="footer-column">
            <h3>Полезное</h3>
            <ul>
              <li><Link href="/rules">Правила покупки билетов</Link></li>
              <li><Link href="/privacy">Политика конфиденциальности</Link></li>
              <li><Link href="/payment-refund">Оплата и возврат</Link></li>
              <li><Link href="/promos">Акции и скидки</Link></li>
              <li><Link href="/gift">Подарочные сертификаты</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-copyright">© 2025 AquaVoyage. Все права защищены.</div>
      </div>
    </footer>
  );
}
'@ | Set-Content -Encoding utf8 "app\ui\SiteFooter.tsx"
