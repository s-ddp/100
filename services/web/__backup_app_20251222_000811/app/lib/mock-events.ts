import { EventCardDTO } from "./types";

export const mockEvents: EventCardDTO[] = [
  {
    id: "1",
    title: "Метеор Кронштадт → Петергоф",
    description: "Скоростная прогулка на метеоре",
    image: "/images/meteor.jpg",
    price: 2500,
  },
  {
    id: "2",
    title: "Метеор Петергоф → Кронштадт",
    description: "Обратный маршрут по Финскому заливу",
    image: "/images/meteor2.jpg",
    price: 2400,
  },
];
