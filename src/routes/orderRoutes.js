import express from 'express';
import { getOrders, placeOrder, updateOrderStatus, cancelOrder, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

router.get("", getOrders);
router.post("/", placeOrder);
router.patch("/:orderId", updateOrderStatus);
router.patch("/cancel/:orderId", cancelOrder);
router.delete("/:orderId", deleteOrder);

export default router;