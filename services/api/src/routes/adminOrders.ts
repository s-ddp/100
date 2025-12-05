import { Router } from "../vendor/express";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../services/crmOrdersService";
import { CrmOrderStatus } from "../services/crmOrdersService";
import { requireRole } from "../utils/authz";

export const adminOrdersRouter = Router();

adminOrdersRouter.use(requireRole(["admin", "manager"]));

adminOrdersRouter.get("/", async (req, res) => {
  try {
    const orders = await listOrders({
      status: req.query.status as string | undefined,
      eventId: req.query.eventId as string | undefined,
      email: req.query.email as string | undefined,
      phone: req.query.phone as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    res.json({ orders });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Failed to list orders" });
  }
});

adminOrdersRouter.get("/:orderId", async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Failed to load order" });
  }
});

adminOrdersRouter.post("/", async (req, res) => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json({ order });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Failed to create order" });
  }
});

adminOrdersRouter.post("/:orderId/status", async (req, res) => {
  try {
    const status = req.body.status as CrmOrderStatus;
    const order = await updateOrderStatus(req.params.orderId, status);
    res.json({ order });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Failed to update status" });
  }
});

adminOrdersRouter.post("/:orderId/cancel", async (req, res) => {
  try {
    const order = await cancelOrder(req.params.orderId);
    res.json({ order });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Failed to cancel order" });
  }
});
