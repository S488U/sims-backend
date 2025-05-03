import express from "express";
import { adminAccess, verifyToken } from "../middlewares/authMiddleware.js";
import { getAllFeedback, getFeedbacksForUsers, addFeedback, deleteFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

// Admin Access
router.get("/", verifyToken, adminAccess, getAllFeedback);
router.delete("/:feedbackId", verifyToken, adminAccess, deleteFeedback);

// Customer & Admin Access
router.get("/user", verifyToken, getFeedbacksForUsers);
router.post("/", verifyToken, addFeedback);

export default router;