import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import { verifyData } from "../utils/verifyData.js";
import Admin from "../models/admin/adminModel.js";
import { hashPassword } from "../utils/hashPassword.js";


// @ Admin Account Creation
export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return next(createError("All fields are required", 403));
  }

  const validationResult = verifyData(name, email, phone, password);

  if (!validationResult.success) {
    return next(createError(validationResult.message, 403));
  }

  let admin = await Admin.findOne({ email });
  if (admin) {
    return next(createError("User already exist", 409));
  }

  const hashedPassword = await hashPassword(password);

  admin = new Admin({ name, email, phone, password: hashedPassword });
  await admin.save();

  res
    .status(201)
    .json({ message: "User account created successfully", status: 201 });
});

// @ Admin Login
export const adminLogin = asyncHandler(async (req, res, next) => {
  res.json({ message: "hello" });
});

