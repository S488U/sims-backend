import express from "express";
import { createAdmin, adminLogin } from "../controllers/adminController.js";

const router = express.Router();

// Admin Account creation
router.post("/create", createAdmin);
router.post("/login", adminLogin);

export default router;
