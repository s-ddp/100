import styles from "./Calendar.module.css";

export default function Calendar() {
  return (
    <section className={styles.calendar}>
      <div className={styles.monthGroup}>
        <div className={styles.monthTitle}>декабрь</div>

        <div className={styles.daysRow}>
          <Day weekday="пн" day="1" />
          <Day weekday="вт" day="2" />
          <Day weekday="ср" day="3" active />
          <Day weekday="чт" day="4" />
          <Day weekday="пт" day="5" />
          <Day weekday="сб" day="6" weekend />
          <Day weekday="вс" day="7" weekend />
        </div>
      </div>
    </section>
  );
}

function Day({
  weekday,
  day,
  weekend,
  active,
}: {
  weekday: string;
  day: string;
  weekend?: boolean;
  active?: boolean;
}) {
  return (
    <div className={styles.dayItem}>
      <div
        className={`${styles.weekday} ${
          weekend ? styles.weekend : ""
        }`}
      >
        {weekday}
      </div>
      <div
        className={`${styles.dayNumber} ${
          active ? styles.active : ""
        }`}
      >
        {day}
      </div>
    </div>
  );
}
