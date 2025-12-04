import { randomUUID } from "crypto";

const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const RETURN_URL = process.env.YOOKASSA_RETURN_URL;
const API_URL = "https://api.yookassa.ru/v3";

export async function createYooPayment(params: {
  amount: number;
  description: string;
  orderId: string;
}) {
  if (!SHOP_ID || !SECRET_KEY) {
    throw new Error("YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY not configured");
  }
  if (!RETURN_URL) {
    throw new Error("YOOKASSA_RETURN_URL not configured");
  }

  const idempotenceKey = randomUUID();
  const body = {
    amount: {
      value: (params.amount / 100).toFixed(2),
      currency: "RUB",
    },
    capture: true,
    description: params.description,
    confirmation: {
      type: "redirect",
      return_url: `${RETURN_URL}?orderId=${params.orderId}`,
    },
    metadata: {
      orderId: params.orderId,
    },
  };

  const auth = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64");
  const resp = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`YooKassa error: ${resp.status} ${text}`);
  }

  return resp.json() as Promise<{
    id: string;
    status: string;
    confirmation?: { confirmation_url?: string };
  }>;
}
