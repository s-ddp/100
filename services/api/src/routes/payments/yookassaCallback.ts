import { Router } from "../../vendor/express";
import { getPrismaClient } from "../../core/prisma";

export const yookassaCallbackRouter = Router();

yookassaCallbackRouter.post("/", async (req, res) => {
  try {
    const prisma = getPrismaClient();
    if (!prisma) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const event = req.body as any;
    const paymentId = event?.object?.id;
    const status = event?.object?.status;
    const orderId = event?.object?.metadata?.orderId;

    if (!orderId || !paymentId) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    if (status === "succeeded") {
      await (prisma as any).order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
      await (prisma as any).payment.update({
        where: { id: paymentId },
        data: { status: "PAID" },
      });
    }

    if (status === "canceled") {
      await (prisma as any).order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      await (prisma as any).payment.update({
        where: { id: paymentId },
        data: { status: "FAILED" },
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("Yookassa callback error", error);
    return res.status(500).json({ error: error?.message ?? "Callback processing failed" });
  }
});
