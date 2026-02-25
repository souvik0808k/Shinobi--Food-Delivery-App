import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getShopOrders,
  updateOrderStatus,
  cancelOrder,
  getDeliveryOrders,
  assignDeliveryBoy,
  verifyPickupOtp,
  markOrderDelivered,
} from "../controllers/order.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// User routes
router.post("/create", verifyToken, createOrder);
router.get("/user/my-orders", verifyToken, getUserOrders);
router.get("/:orderId", verifyToken, getOrderDetails);
router.put("/:orderId/cancel", verifyToken, cancelOrder);

// Shop owner routes
router.get("/shop/orders", verifyToken, getShopOrders);
router.put("/:orderId/status", verifyToken, updateOrderStatus);
router.put("/:orderId/assign-delivery", verifyToken, assignDeliveryBoy);

// Delivery boy routes
router.get("/delivery/my-orders", verifyToken, getDeliveryOrders);
router.put("/:orderId/verify-pickup", verifyToken, verifyPickupOtp);
router.put("/:orderId/mark-delivered", verifyToken, markOrderDelivered);

export default router;
