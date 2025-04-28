import express from "express";
import { getReport, addReport, deleteReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getReport);
router.post("/", addReport);
router.delete("/:id", deleteReport);

export default router;