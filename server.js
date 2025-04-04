import "dotenv/config.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { generalLimiter, authLimiter } from "./src/utils/rateLimiter.js";
import connectDB from "./src/config/db.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { createError } from "./src/utils/errorUtils.js";
import { appLogger } from "./src/middlewares/logger.js";
import healthRoute from "./src/routes/healthRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import supplierRoutes from "./src/routes/supplierRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";

const app = express();
const port = process.env.PORT || 3500;

(async () => {
    try {
      await connectDB();
    } catch (err) {
      console.error("Startup Error: ", err.message);
      process.exit(1);
    }
  
    app.use(cors());
  
    app.use(generalLimiter);
    app.use(appLogger);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static("public"));
  
    app.use("/", healthRoute);
    app.use("/login", authRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/user", userRoutes)
    app.use("/api/supplier", supplierRoutes);
    app.use("/api/category", categoryRoutes);
  
    app.use((req, res, next) => {
      next(createError("Route Not Found", 404));
    });
  
    app.use(errorHandler);
  
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  })();
  