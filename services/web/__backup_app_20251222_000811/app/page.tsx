@'
import CarouselBlock, { CardItem } from "./_components/CarouselBlock";
import CalendarStrip from "./_components/CalendarStrip";

export default function Page() {
  const topSales: CardItem[] = [
    {
      tag: "Хит",
      rating: "4.97",
      title: "Закат с живой музыкой по центральным каналам",
      duration: "2 часа",
      price: "2 990 ₽",
      image: "https://picsum.photos/id/1050/600/400",
    },
    {
      tag: "Хит",
      rating: "4.9",
      title: "Закатное круиз по Неве",
      duration: "2 часа",
      price: "3 500 ₽",
      image: "https://picsum.photos/id/1068/600/400",
    },
    {
      tag: "Хит",
      rating: "5.0",
      title: "Ночной круиз по каналам с ужинами",
      duration: "3 часа",
      price: "3 500 ₽",
      image: "https://picsum.photos/id/1036/600/400",
    },
    {
      tag: "Хит",
      rating: "4.7",
      title: "Прогулка по Неве до Финского залива",
      duration: "2.5 часа",
      price: "3 000 ₽",
      image: "https://picsum.photos/id/1061/600/400",
    },
    {
      tag: "Хит",
      rating: "4.9",
      title: "Детская экскурсия по каналам с мастер-классом",
      duration: "1.5 часа",
      price: "2 200 ₽",
      image: "https://picsum.photos/id/1048/600/400",
    },
  ];

  const riversAndCanals: CardItem[] = [
    {
      tag: "Вечеринка",
      rating: "5.0",
      title: "Ночной круиз по каналам с ужинами",
      duration: "3 часа",
      price: "3 500 ₽",
      image: "https://picsum.photos/id/1036/600/400",
    },
    {
      tag: "Исторический",
      rating: "4.9",
      title: "Экскурсия по каналам с гидом-историком",
      duration: "2.5 часа",
      price: "3 000 ₽",
      image: "https://picsum.photos/id/1039/600/400",
    },
    {
      tag: "Фотосессия",
      rating: "4.8",
      title: "Прогулка по каналам для фотографов",
      duration: "2 часа",
      price: "3 500 ₽",
      image: "https://picsum.photos/id/1043/600/400",
    },
    {
      tag: "Детский",
      rating: "4.9",
      title: "Детская экскурсия по каналам с мастер-классом",
      duration: "1.5 часа",
      price: "2 200 ₽",
      image: "https://picsum.photos/id/1048/600/400",
    },
    {
      tag: "Закат",
      rating: "4.97",
      title: "Закат с живой музыкой по центральным каналам",
      duration: "2 часа",
      price: "2 990 ₽",
      image: "https://picsum.photos/id/1050/600/400",
    },
  ];

  const nevaAndGulf: CardItem[] = [
    {
      tag: "Прогулка",
      rating: "4.7",
      title: "Прогулка по Неве до Финского залива",
      duration: "2.5 часа",
      price: "3 000 ₽",
      image: "https://picsum.photos/id/1061/600/400",
    },
    {
      tag: "Закат",
      rating: "4.9",
      title: "Закатное круиз по Неве",
      duration: "2 часа",
      price: "3 500 ₽",
      image: "https://picsum.photos/id/1068/600/400",
    },
    {
      tag: "Вино",
      rating: "4.8",
      title: "Круиз по Неве с винотекой",
      duration: "3 часа",
      price: "4 800 ₽",
      image: "https://picsum.photos/id/1071/600/400",
    },
    {
      tag: "Музыка",
      rating: "4.9",
      title: "Круиз по Неве с концертом музыки",
      duration: "2.5 часа",
      price: "3 800 ₽",
      image: "https://picsum.photos/id/1074/600/400",
    },
  ];

  return (
    <>
      <CarouselBlock
        variant="topSales"
        anchorId="top-sales"
        title="Хиты продаж"
        subtitle="Билеты раскупают за 48 часов"
        items={topSales}
      />

      <CalendarStrip />

      <section className="excursion-categories">
        <CarouselBlock
          variant="category"
          title="Реки и каналы"
          allLinkHref="/events"
          allLinkText="Посмотреть все →"
          items={riversAndCanals}
        />

        <CarouselBlock
          variant="category"
          title="Нева и Финский залив"
          allLinkHref="/events"
          allLinkText="Посмотреть все →"
          items={nevaAndGulf}
        />
      </section>
    </>
  );
}
'@ | Set-Content -Encoding utf8 "app\page.tsx"
