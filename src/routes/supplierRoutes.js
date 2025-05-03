import express, { application } from "express";
import { verifyToken, adminAccess } from "../middlewares/authMiddleware.js";
import { getSupplier, getSingleSupplier, addSupplier, updateSupplierDetails, updateAllSupplier, updateSupplierColumn, deleteSupplier } from "../controllers/supplierController.js";

const router = express.Router();

// Admin Access
router.post("/", verifyToken, adminAccess, addSupplier);
router.put("/:id", verifyToken, adminAccess, updateAllSupplier);
router.patch("/:id", verifyToken, adminAccess, updateSupplierDetails);
router.delete("/:id", verifyToken, adminAccess, deleteSupplier);

// Customer & Admin Access
router.get("/", verifyToken, getSupplier);
router.get("/:id", verifyToken, getSingleSupplier);

// router.patch("/:id", updateSupplierColumn);

export default router;