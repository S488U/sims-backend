import express from "express";
import { adminAccess, verifyToken } from "../middlewares/authMiddleware.js";
import { getAdmin, createAdmin, updateAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Admin Access
router.get("/", verifyToken, adminAccess, getAdmin);

// Admin Account creation
router.post("/", createAdmin);
router.patch("/", updateAdmin);

export default router;
