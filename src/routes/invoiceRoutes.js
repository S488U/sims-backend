import express from "express";
import { getAllInvoice, getInvoiceByCustomer, getSingleInvoice,  generateInvoice, approveInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", getAllInvoice)
router.get("/:invoiceId", getSingleInvoice);
router.get("", getInvoiceByCustomer)
router.post("/", generateInvoice);
router.patch("/:invoiceId", approveInvoice)

export default router;