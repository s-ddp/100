// services/web/app/lib/api.ts

import { EventCardDTO } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://ticketing-api:4000";

export async function fetchEventsSSR(): Promise<EventCardDTO[]> {
  try {
    const res = await fetch(`${API_URL}/events`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch events:", res.status);
      return [];
    }

    return res.json();
  } catch (e) {
    console.error("fetchEventsSSR error:", e);
    return [];
  }
}
