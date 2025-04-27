import express from "express";
import { getAdmin, createAdmin, updateAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getAdmin);
// Admin Account creation
router.post("/", createAdmin);
router.patch("/", updateAdmin);

export default router;
