import HelpContent from "./HelpContent";
import HelpSidebar from "./HelpSidebar";
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
        <HelpSidebar />
        <HelpContent />
      </div>
    </>
  );
}
