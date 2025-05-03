import express from "express";
import { verifyToken, adminAccess } from "../middlewares/authMiddleware.js";
import { createCustomer, getCustomer, getCustomerById, getCustomerByEmail, updateCustomerPassword, updateCustomerColumn, deleteCustomer } from "../controllers/customerController.js";

const router = express.Router();

// Admin Access
router.post("/", verifyToken, adminAccess, createCustomer);
router.patch("/:id", verifyToken, adminAccess, updateCustomerColumn);
router.delete("/:id", verifyToken, adminAccess, deleteCustomer);

// Customer & Admin Access
router.get("/", verifyToken, getCustomer);
router.get("/:id", verifyToken, getCustomerById);
router.get("/email/:email", verifyToken, getCustomerByEmail);
router.patch("/update/:id", verifyToken, updateCustomerPassword);

export default router;