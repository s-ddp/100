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
      title: "Тестовая прогулка",
      description: "Демо-событие для дизайна",
      date: "2025-06-01",
      priceFrom: 2500
    }
  ]);
});

app.listen(4000, () => {
  console.log("API started on http://localhost:4000");
});
