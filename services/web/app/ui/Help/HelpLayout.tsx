import styles from "./Help.module.css";

export default function HelpLayout() {
  return (
    <>
      <header className={styles.header}>
        <a className={styles.logo} href="/">
          AquaVoyage <span>Помощь</span>
        </a>

        <div className={styles.search}>
          <input placeholder="Поиск ответа..." />
        </div>

        <div className={styles.actions}>
          <span>⚙</span>
          <span>🌐</span>
        </div>
      </header>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <details open>
            <summary>Покупка билетов</summary>
            <ul>
              <li className={styles.active}>Выбор даты и времени</li>
              <li>Выбор места на судне</li>
              <li>Оплата билетов</li>
              <li>Подтверждение покупки</li>
            </ul>
          </details>

          <details>
            <summary>Перед поездкой</summary>
            <ul>
              <li>Где взять билет</li>
              <li>Время прибытия</li>
              <li>Что взять с собой</li>
            </ul>
          </details>
        </aside>

        <main className={styles.content}>
          <h1>Выбор даты и времени экскурсии</h1>

          <p>
            На странице экскурсии вы увидите календарь с доступными датами и
            слотами времени.
          </p>

          <img
            src="https://i.ibb.co/ZBkZ1qF/date-selection.png"
            alt="Выбор даты"
          />

          <ol>
            <li>Откройте страницу экскурсии</li>
            <li>Выберите дату</li>
            <li>Выберите время</li>
            <li>Нажмите «Купить билет»</li>
          </ol>
        </main>
      </div>
    </>
  );
}
