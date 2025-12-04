import { Router } from "../vendor/express";

import { buildSeatStatus, resolveEvent, resolveTrip } from "../core/waterStore";

export const tripsRouter = Router();

tripsRouter.get("/:tripId/seatmap", (req, res) => {
  const { tripId } = req.params ?? {};
  if (!tripId) {
    return res.status(400).json({ error: "tripId is required" });
  }

  const trip = resolveTrip(tripId);
  if (!trip) {
    return res.status(404).json({ error: "Trip not found" });
  }

  const event = resolveEvent(trip.eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found for trip" });
  }

  const seatMap = buildSeatStatus(event.id, trip.id);
  if (!seatMap) {
    return res.status(404).json({ error: "Seat map not available" });
  }

  return res.json({ tripId: trip.id, seatMap });
});
