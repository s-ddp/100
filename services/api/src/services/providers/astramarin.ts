import axios from "../../legacy/shims/axios.js";

const BASE_URL = process.env.ASTRAMARIN_API_URL;
const API_KEY = process.env.ASTRAMARIN_API_KEY;

export async function cancelBookSeat(externalBookingId: string) {
  if (!BASE_URL || !API_KEY) {
    console.warn("Astramarin config not set, skip cancelBookSeat");
    return;
  }

  try {
    await axios.post(
      `${BASE_URL}/cancelBookSeat`,
      { booking_id: externalBookingId },
      {
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e) {
    console.error("Astramarin cancelBookSeat error", e);
  }
}
