import express from "express";
import { verifyToken, adminAccess } from "../middlewares/authMiddleware.js";
import { createUser, getUser, getUserById, updateUser, updateUserColumn, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUser);
router.get("/:id", getUserById);
router.post("/", createUser);

//Update User
router.put("/:id", verifyToken, updateUser);
router.patch("/:id", verifyToken, updateUserColumn);

//Delete User
router.delete("/:id", deleteUser);

export default router;