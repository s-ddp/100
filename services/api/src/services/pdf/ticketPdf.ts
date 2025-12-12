import PDFDocument from "../../shims/pdfkit.js";
import { Order, OrderSeat, Event } from "@prisma/client";

type FullOrder = Order & {
  seats: OrderSeat[];
  event: Event;
};

export async function generateTicketPdf(order: FullOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    doc.fontSize(20).text("Электронный билет", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Заказ № ${order.id}`);
    doc.text(`Мероприятие: ${order.event.title}`);
    doc.text(
      `Дата и время: ${order.event.date.toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      })}`
    );
    doc.text(`Имя: ${order.customerName || "-"}`);
    doc.text(`Телефон: ${order.customerPhone || "-"}`);
    doc.text(`Email: ${order.customerEmail || "-"}`);
    doc.moveDown();

    doc.fontSize(14).text("Места:", { underline: true });
    order.seats.forEach((s) => {
      doc.text(`• Место: ${s.seatId}`);
  });

  doc.moveDown();
  const totalRub = Number(order.totalAmount ?? 0) / 100;
  doc.text(`Сумма: ${totalRub.toFixed(2)} ₽`, { align: "right" });

  doc.end();
  });
}
