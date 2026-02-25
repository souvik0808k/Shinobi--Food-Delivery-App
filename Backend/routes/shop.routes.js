import express from "express";
import {
  createShop,
  getMyShop,
  updateShop,
  getShopById,
  getAllShops,
  toggleShopStatus,
} from "../controllers/shop.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/create", verifyToken, createShop);
router.get("/my-shop", verifyToken, getMyShop);
router.put("/update", verifyToken, updateShop);
router.patch("/toggle-status", verifyToken, toggleShopStatus);

// Public routes
router.get("/all", getAllShops);
router.get("/:shopId", getShopById);

export default router;
