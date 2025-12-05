import SeatMapClient from "./SeatMapClient";

export default function SeatMapPage({ params }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Выбор мест — {params.id}</h1>
      <p style={{ color: "#9ca3af", marginBottom: 16 }}>
        Интерактивная схема мест обновляется в реальном времени через WebSocket.
      </p>
      <SeatMapClient eventId={params.id} />
    </div>
  );
}
