import express from "express";
import { verifyToken, adminAccess } from "../middlewares/authMiddleware.js";
import { getInventory, getSingleInventory, getInventoryByCustomer, addInventory, updateInventoryColumn, deleteInventory } from "../controllers/inventoryController.js";

const router = express.Router();

// Admin Access
router.get("/", verifyToken, adminAccess, getInventory);
router.post("/", verifyToken, adminAccess, addInventory);
router.patch("/:inventoryId", verifyToken, adminAccess, updateInventoryColumn);
router.delete("/:inventoryId", verifyToken, adminAccess, deleteInventory);

// Customer & Admin Access
router.get("/customer/", verifyToken, getInventoryByCustomer)
router.get("/:inventoryId", verifyToken, getSingleInventory);

export default router;