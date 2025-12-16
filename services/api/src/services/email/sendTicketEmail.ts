import nodemailer from "../../legacy/shims/nodemailer.js";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT ? Number(SMTP_PORT) : 587,
  secure: false,
  auth: SMTP_USER
    ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    : undefined,
});

export async function sendTicketEmail(to: string, orderId: string, pdfBuffer: Buffer) {
  if (!to) {
    console.warn("No email specified for sendTicketEmail");
    return;
  }

  const mailOptions = {
    from: SMTP_FROM,
    to,
    subject: `Ваш билет на мероприятие (заказ №${orderId})`,
    text: `Здравствуйте! Во вложении ваш билет (заказ №${orderId}).`,
    attachments: [
      {
        filename: `ticket-${orderId}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}
