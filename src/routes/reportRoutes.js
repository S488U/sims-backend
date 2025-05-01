import express from "express";
import { getReport, addReport, deleteReport, getSingleReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getReport);
router.get("/:id", getSingleReport);
router.post("/", addReport);
router.delete("/:id", deleteReport);

export default router;