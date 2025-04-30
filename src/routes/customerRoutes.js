import express from "express";
import { verifyToken, adminAccess } from "../middlewares/authMiddleware.js";
import { createCustomer, getCustomer, getCustomerById, getCustomerByEmail, updateCustomerPassword, updateCustomerColumn, deleteCustomer } from "../controllers/customerController.js";

const router = express.Router();

router.get("/", getCustomer);
router.get("/:id", getCustomerById);
router.get("/email/:email", getCustomerByEmail);
router.post("/", createCustomer);

//Update Customer
router.patch("/update/:id", updateCustomerPassword);
router.patch("/:id", updateCustomerColumn);

// router.put("/:id", verifyToken, updateCustomer);
// router.patch("/:id", verifyToken, updateCustomerColumn);

//Delete Customer
router.delete("/:id", deleteCustomer);

export default router;