import express from "express";
import { verifyToken, adminAccess } from "../middlewares/authMiddleware.js";
import { getAllInvoice, getInvoiceByCustomer, getSingleInvoice, generateInvoice, approveInvoice, updatePaymentDetails, updateStatus, deleteInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

// Admin Access
router.get("/", verifyToken, adminAccess, getAllInvoice);
router.post("/", verifyToken, adminAccess, generateInvoice);
router.patch("/:invoiceId", verifyToken, adminAccess, approveInvoice);
router.patch("/payment/status/:invoiceId", verifyToken, adminAccess, updateStatus);
router.delete("/:invoiceId", verifyToken, adminAccess, deleteInvoice);

// Customer & Admin Access
router.get("/:invoiceId", verifyToken, getSingleInvoice);
router.get("/customer/:customerId", verifyToken, getInvoiceByCustomer);
router.patch("/payment/:invoiceId", verifyToken, updatePaymentDetails);

export default router;