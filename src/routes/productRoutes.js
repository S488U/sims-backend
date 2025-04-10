import express from "express";
import { getProducts,getSingleProduct, addProducts, getQueriedProducts, updateAllProducts, deleteProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/get", getQueriedProducts);
router.get("/:productId", getSingleProduct);
router.post("/", addProducts);
router.put("/", updateAllProducts);
router.delete("/", deleteProducts);

export default router;