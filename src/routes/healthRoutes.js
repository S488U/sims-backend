import express from "express";
import { mainRoute } from "../controllers/healthController.js";

const router = express.Router();

router.get("/", mainRoute);


export default router;
