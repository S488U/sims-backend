import express, { application } from "express";
import { getSupplier, getSingleSupplier, addSupplier, updateSupplierDetails, updateAllSupplier, updateSupplierColumn, deleteSupplier } from "../controllers/supplierController.js";

const router = express.Router();

router.get("/", getSupplier);
router.get("/:id", getSingleSupplier);
router.post("/", addSupplier);
router.put("/:id", updateAllSupplier);
router.patch("/:id", updateSupplierDetails);
// router.patch("/:id", updateSupplierColumn);
router.delete("/:id", deleteSupplier);

export default router;