export type SeatmapBroadcast = (eventId: string, seatId: string, status: string) => void;

let broadcaster: SeatmapBroadcast | null = null;

export function registerSeatmapBroadcaster(fn: SeatmapBroadcast) {
  broadcaster = fn;
}

export function emitSeatStatus(eventId: string, seatId: string, status: string) {
  if (broadcaster) {
    try {
      broadcaster(eventId, seatId, status);
    } catch (err) {
      console.error("seatmap broadcast error", err);
    }
  }
}
