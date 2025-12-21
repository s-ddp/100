import { Router } from "express";

const router = Router();

/**
 * MOCK оплаты
 * используется только для разработки фронта
 */

router.post("/create", (_req, res) => {
  res.json({
    paymentId: "mock-payment-id",
    confirmationUrl: "http://localhost:3000/payment/success"
  });
});

router.post("/webhook", (_req, res) => {
  res.json({ ok: true });
});

export default router;
