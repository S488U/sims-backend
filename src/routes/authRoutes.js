import express from "express";
import { login } from "../controllers/authController.js";
import { adminAccess, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Customer and Admin Login Route
router.post("/", login);

// Demo route will remove when in production
router.get("/", verifyToken, adminAccess, (req, res, next) => {
    res.json({
        customer: req.customers ?? null,
        admin: req.admin ?? null,
        isAdmin: req.isAdmin
    });
});

export default router;