import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/events", (_req, res) => {
  res.json([
    {
      id: "event-1",
      title: "Тестовое событие",
      description: "Заглушка для дизайна",
      date: new Date().toISOString()
    }
  ]);
});

app.post("/payments/create", (_req, res) => {
  res.json({
    paymentId: "mock-payment",
    redirectUrl: "/checkout/success"
  });
});

app.listen(4000, () => {
  console.log("API DEV started on http://localhost:4000");
});
