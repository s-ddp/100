import Link from "next/link";

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
      <main className="container">
        <h1>Экскурсия не найдена</h1>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>{group.title}</h1>
      <p>{group.description}</p>

      <div className="excursion-grid">
        {group.events.map((e: any) => (
          <Link
            key={e.slug}
            href={`/excursions/event/${e.slug}`}
            className="excursion-card"
          >
            <div
              className="excursion-img"
              style={{ backgroundImage: `url(${e.img})` }}
            />
            <h3>{e.title}</h3>
            <strong>{e.price}</strong>
          </Link>
        ))}
        {group.events.length === 0 && (
          <div className="excursion-empty">Скоро добавим расписание</div>
        )}
      </div>
    </main>
  );
}
