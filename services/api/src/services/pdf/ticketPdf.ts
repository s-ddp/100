import PDFDocument from "pdfkit";

export async function generateTicketPdf(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    doc.fontSize(20).text("Электронный билет", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Заказ № ${order.id}`);
    doc.text(`Мероприятие: ${order.event.title}`);
    doc.text(
      `Дата и время: ${new Date(order.event.date).toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      })}`
    );

    doc.text(`Имя: ${order.customerName || "-"}`);
    doc.text(`Телефон: ${order.customerPhone || "-"}`);
    doc.text(`Email: ${order.customerEmail || "-"}`);

    doc.moveDown();
    doc.fontSize(14).text("Места:", { underline: true });

    for (const seat of order.seats ?? []) {
      doc.text(`• ${seat.label}`);
    }

    doc.end();
  });
}
