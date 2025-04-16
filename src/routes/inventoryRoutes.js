import express from "express";
import { getInventory, getSingleInventory, addInventory, updateInventoryColumn, deleteInventory } from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);
router.get("/:inventoryId", getSingleInventory);
router.post("/", addInventory);
router.patch("/:inventoryId", updateInventoryColumn);
router.delete("/:inventoryId", deleteInventory);

export default router;