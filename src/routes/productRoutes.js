import express from "express";
import { getProducts, addProducts, getSupplierProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:supplierId", getSupplierProducts);
router.post("/", addProducts);

export default router;