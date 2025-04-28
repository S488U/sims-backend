import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import { verifyData } from "../utils/verifyData.js";
import Admin from "../models/admin/adminModel.js";
import { hashPassword } from "../utils/hashPassword.js";
import { decrypt } from "dotenv";

// @ GET: /api/admin To view admin for debugging. Production Time it will be removed
export const getAdmin = asyncHandler(async (req, res, next) => {
  const timeTaken = Date.now() - res.locals.startTime;

  const admin = await Admin.findOne().select("-password -__v");
  if(!admin) {
    return next(createError("Admin not found", 404));
  }

  res.status(200).json({
    message: "Admin exist",
    success: true,
    statusCode: 200,
    admin,
    timeTaken
  })
})

// @  POST: /api/admin Admin Account Creation
export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return next(createError("All fields are required", 403));
  }

  const validationResult = verifyData(name, email, phone, password);

  if (!validationResult.success) {
    return next(createError(validationResult.message, 403));
  }

  const admin = await Admin.findOne();
  if (admin) {
    return next(createError("Admin already exist", 409));
  }

  const hashedPassword = await hashPassword(password);

  const newAdmin = new Admin({ name, email, phone, password: hashedPassword });
  await newAdmin.save();

  res.status(201).json({
    message: "Admin account created successfully",
    success: true,
    statusCode: 201
  });
});

// @ PATCH : /api/admin Updates admin details
export const updateAdmin = asyncHandler(async (req, res, next) => {
  const { name, password, email, phone } = req.body;

  let decryptObject = {};
  if (name) decryptObject.name = name;
  if (email) decryptObject.email = email;
  if (phone) decryptObject.phone = phone;
  if (password) decryptObject.password = password;


  const decrypt = await Promise.allSettled(
    Object.entries(decryptObject).map(async ([key, value]) => {
      if (value) {
        const decodedValue = Buffer.from(value, "base64").toString("utf-8");
        return [key, decodedValue];
      }
    })
  );

  const decrypted = {};
  decrypt.forEach(entry => {
    if (entry.status === "fulfilled") {
      const [key, value] = entry.value;
      if (value !== undefined) {
        decrypted[key] = value;
      }
    }
  })

  const admin = await Admin.findOne();
  if (!admin) {
    return next(createError("Admin not found", 404));
  }

  if (decrypted.password) {
    const hashedPassword = await hashPassword(decrypted.password);
    decrypted.password = hashedPassword;
  }

  Object.assign(admin, decrypted);
  await admin.save();

  res.status(200).json({
    message: "Admin updated successfully",
    success: true,
    statusCode: 200
  });
});

