import styles from "./Help.module.css";

export default function HelpSidebar() {
  return (
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
  );
}
