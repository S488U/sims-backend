import express from "express";
import { verifyToken, adminAccess } from "../middlewares/authMiddleware.js";
import { getReport, addReport, deleteReport, getSingleReport } from "../controllers/reportController.js";

const router = express.Router();

// Admin Access
router.get("/", verifyToken, adminAccess, getReport);
router.get("/:id", verifyToken, adminAccess, getSingleReport);
router.post("/", verifyToken, adminAccess, addReport);
router.delete("/:id", verifyToken, adminAccess, deleteReport);

export default router;