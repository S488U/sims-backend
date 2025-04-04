import { asyncHandler } from "../middlewares/asyncHandler.js";
import Retailers from "../models/retailers/retailersModel.js";
import { verifyData } from "../utils/verifyData.js";
import { createError } from "../utils/errorUtils.js";
import { hashPassword } from "../utils/hashPassword.js";
import mongoose from "mongoose";

// @ userRoutes Get retailers [sort, search, limit ]
export const getUser = asyncHandler(async (req, res, next) => {
  let { search, sort, order, limit } = req.query;

  order = order === "desc" ? -1 : 1;
  limit = limit === "all" ? 0 : parseInt(limit) || 10;

  let filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  let sortOptions = {};
  if (sort) {
    sortOptions[sort] = order;
  } else {
    sortOptions["createdAt"] = order;
  }

  const retailers = await Retailers.find(filter)
    .sort(sortOptions)
    .limit(limit)
    .lean();

  if (retailers.length === 0) {
    return next(createError("No user found", 404));
  }

  res.status(200).json({
    statusCode: 200,
    message: `${retailers.length} were found`,
    data: retailers,
  });
});

// @ Get a single retailer by ID
export const getUserById = asyncHandler(async (req, res, next) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError("Invalid User ID", 400));
  }

  const retailer = await Retailers.findById(id);
  if (!retailer) {
    return next(createError(`User with ID: ${id} not found!`, 404));
  }

  res.status(200).json({
    message: `User with ID: ${id} found!`,
    statusCode: 200,
    data: retailer,
  });
});

// @ retailer Account Creation
export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(createError("All fields are required", 403));
  }

  const validationResult = verifyData({ name, email, password });

  if (!validationResult.success) {
    return next(createError(validationResult.message, 403));
  }

  let retailers = await Retailers.findOne({ email });
  if (retailers) {
    return next(createError("User with same mail id already exist", 403));
  }

  const hashedPassword = await hashPassword(password);

  retailers = new Retailers({ name, email, password: hashedPassword });
  await retailers.save();

  res.status(201).json({
    message: "Retailer created successfully",
    statusCode: 201,
    retailers,
  });
});

// @ Update User Details All at once
export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError("Invalid User ID", 400));
  }

  const validationResult = verifyData({ name, email, password });

  if (!validationResult.success) {
    return next(createError(validationResult.message, 403));
  }

  const hashedPassword = await hashPassword(password);

  let retailer = await Retailers.findByIdAndUpdate(id, { $set: { name, email, password: hashedPassword } }, { new: true, timestamps: true });

  if (!retailer) {
    return next(createError(`User with ID: ${id} not found!`, 404));
  }

  console.log(retailer);

  res.status(200).json({
    message: "Retailer Data Updated successfully",
    statusCode: 200,
    retailer,
  });

});

export const updateUserColumn = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError("Invalid User ID", 400));
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (password) updateFields.password = password;

  const validationResult = verifyData(updateFields);

  if (!validationResult.success) {
    return next(createError(validationResult.message, 403));
  }

  if (password) updateFields.password = await hashPassword(password);

  const retailers = await Retailers.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true });

  if (!retailers) {
    return next(createError(`User with ID: ${id} not found!`, 404));
  }

  console.log(retailers);

  res.status(200).json({
    message: "Retailers data updated successfully",
    columnsUpdated: Object.keys(updateFields),
    statusCode: 200
  });

});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError("Invalid User ID", 404));
  }

  const retailers = await Retailers.findByIdAndDelete(id);

  if (!retailers) {
    return next(createError(`User with Id: ${id} not found`, 404));
  }

  res.status(200).json({
    message: `User with Id: ${id} deleted successfully`,
    statusCode: 200,
  });

});