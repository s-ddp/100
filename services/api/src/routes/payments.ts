import { Router } from "../vendor/express";
import { getPrismaClient } from "../core/prisma";
import { createYooPayment } from "../core/yookassaClient";
import { CRM_ORDER_STATUS, CrmOrderStatus } from "../services/crmOrdersService";
import { yookassaCallbackRouter } from "./payments/yookassaCallback";

export const paymentsRouter = Router();

paymentsRouter.use("/yookassa/callback", yookassaCallbackRouter);

const PAYABLE_STATUSES: CrmOrderStatus[] = [
  CRM_ORDER_STATUS.PENDING,
  CRM_ORDER_STATUS.LOCKED,
];

paymentsRouter.post("/yookassa/create", async (req, res) => {
  try {
    const { orderId } = req.body as { orderId?: string };
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const prisma = getPrismaClient();
    if (!prisma) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const order = await (prisma as any).crmOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (!PAYABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({ error: "Order is not payable" });
    }

    const payment = await createYooPayment({
      amount: order.totalPrice,
      description: `Оплата заказа ${order.id}`,
      orderId: order.id,
    });

    await (prisma as any).crmOrder.update({
      where: { id: order.id },
      data: { paymentId: payment.id, paymentStatus: payment.status },
    });

    res.json({
      paymentId: payment.id,
      status: payment.status,
      confirmationUrl: payment.confirmation?.confirmation_url,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message ?? "Payment creation failed" });
  }
});

paymentsRouter.post("/yookassa/webhook", async (req, res) => {
  try {
    const prisma = getPrismaClient();
    if (!prisma) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const event = req.body as any;
    const object = event?.object;
    if (!object?.id || !object?.metadata?.orderId) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const orderId = object.metadata.orderId as string;
    let newStatus: CrmOrderStatus | undefined;
    if (object.status === "succeeded") newStatus = CRM_ORDER_STATUS.PAID;
    if (object.status === "canceled") newStatus = CRM_ORDER_STATUS.CANCELLED;

    await (prisma as any).crmOrder.update({
      where: { id: orderId },
      data: {
        paymentId: object.id,
        paymentStatus: object.status,
        status: newStatus ?? CRM_ORDER_STATUS.PENDING,
      },
    });

    res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message ?? "Webhook error" });
  }
});
