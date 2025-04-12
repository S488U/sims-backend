import express from "express";
import { getProducts,getSingleProduct, addProducts, getSupplierProduct, updateAllProducts, deleteProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/get", getSupplierProduct);
router.get("/:productId", getSingleProduct);
router.post("/", addProducts);
router.put("/", updateAllProducts);
router.delete("/", deleteProducts);

export default router;