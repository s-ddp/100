import YooCheckout from "@a2seven/yoo-checkout";

const checkout = new YooCheckout({
  shopId: process.env.YOOKASSA_SHOP_ID!,
  secretKey: process.env.YOOKASSA_SECRET_KEY!,
});

export async function createPayment({
  orderId,
  amount,
  description,
}: {
  orderId: string;
  amount: number;
  description: string;
}) {
  return checkout.createPayment({
    amount: {
      value: amount.toFixed(2),
      currency: "RUB",
    },
    confirmation: {
      type: "redirect",
      return_url: `${process.env.FRONTEND_URL}/checkout/success`,
    },
    capture: true,
    description,
    metadata: { orderId },
  });
}
