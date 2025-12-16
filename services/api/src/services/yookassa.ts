import YooKassa from "../legacy/shims/yookassa.js";

interface CreatePaymentParams {
  orderId: string;
  amount: number;
  description: string;
}

function getClient() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) return null;
  return new YooKassa({ shopId, secretKey });
}

export async function yookassaCreatePayment({ orderId, amount, description }: CreatePaymentParams) {
  const client = getClient();
  const confirmationUrl = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/checkout/success?orderId=${orderId}`;

  if (!client) {
    return {
      id: `local-${Date.now()}`,
      status: "pending",
      confirmation: { confirmation_url: confirmationUrl },
      amount: { value: amount, currency: "RUB" },
      metadata: { orderId },
    } as const;
  }

  return client.createPayment({
    amount: { value: amount.toFixed(2), currency: "RUB" },
    confirmation: {
      type: "redirect",
      return_url: confirmationUrl,
    },
    description,
    metadata: {
      orderId,
    },
  });
}
