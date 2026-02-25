import express from "express";
import {
  createItem,
  getMyItems,
  getItemsByShop,
  getItemById,
  updateItem,
  deleteItem,
  toggleItemStock,
} from "../controllers/item.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/create", verifyToken, createItem);
router.get("/my-items", verifyToken, getMyItems);
router.put("/:itemId", verifyToken, updateItem);
router.delete("/:itemId", verifyToken, deleteItem);
router.patch("/:itemId/toggle-stock", verifyToken, toggleItemStock);

// Public routes
router.get("/shop/:shopId", getItemsByShop);
router.get("/:itemId", getItemById);

export default router;
