import mongoose from "mongoose";
import { createError } from "../utils/errorUtils.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB Database Connected");
  } catch (err) {
    console.error("Database connection error: ", err.message);
    throw createError("Failed to connect to the Database", err.status);
  }
};

export default connectDB;
