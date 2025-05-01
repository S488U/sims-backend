import express from "express";
import { getAllInvoice, getInvoiceByCustomer, getSingleInvoice, generateInvoice, approveInvoice, updatePaymentDetails, updateStatus, deleteInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", getAllInvoice);
router.get("/:invoiceId", getSingleInvoice);
router.get("/customer/:customerId", getInvoiceByCustomer);
router.post("/", generateInvoice);
router.patch("/:invoiceId", approveInvoice);
router.patch("/payment/:invoiceId", updatePaymentDetails);
router.patch("/payment/status/:invoiceId", updateStatus);
router.delete("/:invoiceId", deleteInvoice);

export default router;