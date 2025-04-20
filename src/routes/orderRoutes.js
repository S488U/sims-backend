import express from 'express';
import { getOrders, placeOrder, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

router.get("", getOrders);
router.post("/", placeOrder);
router.patch("/:orderId", updateOrderStatus);
router.delete("/:orderId", deleteOrder);

export default router;