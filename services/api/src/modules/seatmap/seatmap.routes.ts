import { Router } from "express";
import {
  acquireSeatLocks,
  getSeatmapForEvent,
  releaseSeatLocks,
} from "./seatmap.service";

const router = Router();

router.get("/events/:id/seatmap", async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const seatmap = await getSeatmapForEvent(eventId);
    res.json(seatmap);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

router.post("/events/:id/seat-lock/acquire", async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { seatIds, ttlMinutes } = req.body ?? {};

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: "seatIds is required" });
    }

    const sessionId =
      (req as any).session?.id || req.headers["x-session-id"]?.toString() || "anonymous";
    const parsedSeatIds = seatIds
      .map((id: any) => Number(id))
      .filter((id: number) => Number.isFinite(id));

    if (!parsedSeatIds.length) {
      return res.status(400).json({ error: "seatIds must be numeric" });
    }

    const result = await acquireSeatLocks({
      eventId,
      seatIds: parsedSeatIds,
      sessionId,
      ttlMinutes,
    });

    if (!result.success) {
      return res.status(409).json(result);
    }

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

router.post("/events/:id/seat-lock/release", async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { seatIds } = req.body ?? {};

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: "seatIds is required" });
    }

    const sessionId =
      (req as any).session?.id || req.headers["x-session-id"]?.toString() || "anonymous";

    const parsedSeatIds = seatIds
      .map((id: any) => Number(id))
      .filter((id: number) => Number.isFinite(id));

    if (!parsedSeatIds.length) {
      return res.status(400).json({ error: "seatIds must be numeric" });
    }

    const result = await releaseSeatLocks({
      eventId,
      seatIds: parsedSeatIds,
      sessionId,
    });

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

export default router;
