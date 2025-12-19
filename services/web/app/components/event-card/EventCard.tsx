import React from "react";

export interface EventCardDTO {
  id: string;
  title: string;
  image?: string; // ← ВОТ ОН, БЛЯТЬ
  price?: number;
}

interface Props {
  event: EventCardDTO;
}

export const EventCard: React.FC<Props> = ({ event }) => {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
      {event.image && (
        <img
          src={event.image}
          alt={event.title}
          style={{ width: "100%", height: 200, objectFit: "cover" }}
        />
      )}

      <div style={{ padding: 12 }}>
        <h3>{event.title}</h3>

        {event.price && (
          <p>
            Цена: <strong>{event.price} ₽</strong>
          </p>
        )}
      </div>
    </div>
  );
};
