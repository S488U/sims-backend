import express from "express";
import { getAllFeedback, getFeedbacksForUsers, addFeedback, deleteFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

router.get("/", getAllFeedback);
router.get("/user", getFeedbacksForUsers);
router.post("/", addFeedback);
router.delete("/:feedbackId", deleteFeedback);

export default router;