import Link from "next/link";
import styles from "../Excursion.module.css";

const groups: any = {
  "reki-i-kanaly": {
    title: "Реки и каналы",
    description: "Прогулки по историческим каналам Санкт-Петербурга",
    events: [
      {
        title: "Закат с живой музыкой по каналам",
        slug: "sunset-live-music",
        price: "от 2 990 ₽",
        img: "https://images.unsplash.com/photo-1599642152982-1133cd37a3ce?w=600",
      },
    ],
  },
  "neva-i-zaliv": {
    title: "Нева и Финский залив",
    description: "Просторные маршруты и панорамы",
    events: [],
  },
};

export default function GroupPage({ params }: { params: { group: string } }) {
  const group = groups[params.group];

  if (!group) {
    return (
      <main className={styles.container}>
        <h1>Экскурсия не найдена</h1>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1>{group.title}</h1>
      <p>{group.description}</p>

      <div className={styles.grid}>
        {group.events.map((e: any) => (
          <Link
            key={e.slug}
            href={`/excursions/${params.group}/${e.slug}`}
            className={styles.card}
          >
            <div
              className={styles.cardImg}
              style={{ backgroundImage: `url(${e.img})` }}
            />
            <h3 className={styles.cardTitle}>{e.title}</h3>
            <strong className={styles.cardPrice}>{e.price}</strong>
          </Link>
        ))}
        {group.events.length === 0 && (
          <div className={styles.empty}>Скоро добавим расписание</div>
        )}
      </div>
    </main>
  );
}
