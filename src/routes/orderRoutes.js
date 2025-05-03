import express from 'express';
import { verifyToken, adminAccess } from '../middlewares/authMiddleware.js';
import { getOrders, placeOrder, updateOrderStatus, cancelOrder, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

// Admin Access
router.patch("/:orderId", verifyToken, adminAccess, updateOrderStatus);
router.delete("/:orderId", verifyToken, adminAccess, deleteOrder);

// Customer & Admin Access
router.get("", verifyToken, getOrders); // To get all Orders are restricted from customers
router.post("/", verifyToken, placeOrder);
router.patch("/cancel/:orderId", verifyToken, cancelOrder);

export default router;