import { Router } from "../../vendor/express.js";
import { getPrismaClient } from "../../core/prisma.js";
import { generateTicketPdf } from "../../services/pdf/ticketPdf.js";
import { sendTicketEmail } from "../../services/email/sendTicketEmail.js";
import { publishNewOrderMessage } from "../../services/queue/rabbit.js";

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
    const order = await (prisma as any).order.findUnique({
      where: { id: orderId },
      include: { seats: true, event: true },
    });

    if (!order) {
      console.error("Order not found for callback", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    if (status === "succeeded") {
      const totalAmountRub = Number(order.totalAmount ?? 0) / 100;
      const updatedOrder = await (prisma as any).order.update({
        where: { id: orderId },
        data: { status: "PAID" },
        include: { seats: true, event: true },
      });
      await (prisma as any).payment.update({
        where: { id: paymentId },
        data: { status: "PAID" },
      });

      const pdfBuffer = await generateTicketPdf(updatedOrder as any);
      if (updatedOrder.customerEmail) {
        await sendTicketEmail(updatedOrder.customerEmail, updatedOrder.id, pdfBuffer);
      }

      await publishNewOrderMessage({
        type: "order_paid",
        orderId: updatedOrder.id,
        eventId: updatedOrder.eventId,
        totalAmount: totalAmountRub,
        customerName: updatedOrder.customerName,
        customerPhone: updatedOrder.customerPhone,
        customerEmail: updatedOrder.customerEmail,
        seats: updatedOrder.seats.map((s: any) => s.seatId),
        paidAt: new Date().toISOString(),
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

      await publishNewOrderMessage({
        type: "order_failed",
        orderId,
        reason: "payment_canceled",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("Yookassa callback error", error);
    return res.status(500).json({ error: error?.message ?? "Callback processing failed" });
  }
});
