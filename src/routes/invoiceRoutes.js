import express from "express";
import { getAllInvoice, getInvoiceByCustomer, getSingleInvoice, generateInvoice, approveInvoice, updatePaymentDetails, updateStatus } from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/draft", getInvoiceByCustomer);
router.get("/", getAllInvoice);
router.get("/:invoiceId", getSingleInvoice);
router.post("/", generateInvoice);
router.patch("/:invoiceId", approveInvoice);
router.patch("/payment/:invoiceId", updatePaymentDetails);
router.patch("/payment/status/:invoiceId", updateStatus);

export default router;