import { asyncHandler } from "../middlewares/asyncHandler.js";
import Customers from "../models/customers/customerModel.js";
import { verifyData } from "../utils/verifyData.js";
import { createError } from "../utils/errorUtils.js";
import { hashPassword } from "../utils/hashPassword.js";
import mongoose from "mongoose";

// @ userRoutes Get customers [sort, search, limit ]
export const getCustomer = asyncHandler(async (req, res, next) => {
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

  const customers = await Customers.find(filter)
    .sort(sortOptions)
    .limit(limit)
    .lean()
    .select("-__v -password");

  if (customers.length === 0) {
    return next(createError("No Customer found", 404));
  }

  res.status(200).json({
    message: `${customers.length} were found`,
    success: true,
    statusCode: 200,
    data: customers,
  });
});

// @ Get a single Customer by ID
export const getCustomerById = asyncHandler(async (req, res, next) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError("Invalid Customer ID", 400));
  }

  const retailer = await Customers.findById(id).select("-__v -password");
  if (!retailer) {
    return next(createError(`Customer with ID: ${id} not found!`, 404));
  }

  res.status(200).json({
    message: `Customer with ID: ${id} found!`,
    success: true,
    statusCode: 200,
    data: retailer,
  });
});

// @ Get customer by email
export const getCustomerByEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.params;

  if (!email) {
    return next(createError("No email provided", 400));
  }

  const validationResult = verifyData({ email });
  if (!validationResult.success) {
    return next(createError(validationResult.message, 400));
  }

  const customer = await Customers.findOne({ email }).select("_id isActive");
  if (!customer) {
    return next(createError(`No customer found in this email ID: ${email}`, 400));
  } else if (customer.isActive === true) {
    return next(createError("Customer is already Active", 400));
  }

  res.status(200).json({
    message: "Customer found succesfully",
    success: true,
    statusCode: 200,
    customer,
  });
});

// @ Customer Account Creation
export const createCustomer = asyncHandler(async (req, res, next) => {
  const { name, email, phone, address, password, paymentPreference } = req.body;

  if (!name || !email || !phone || !address || !password || !paymentPreference) {
    return next(createError("All fields are required", 403));
  }

  const allowedPreferences = ["weekly", "monthly"];
  if (!allowedPreferences.includes(paymentPreference?.toLowerCase())) {
    return next(createError("Invalid payment preference. Choose either 'weekly' or 'monthly'", 400));
  }

  const validationResult = verifyData({ name, email, phone, address, password });

  if (!validationResult.success) {
    return next(createError(validationResult.message, 403));
  }

  let customers = await Customers.findOne({ email });
  if (customers) {
    return next(createError("Customer with same mail id already exist", 403));
  }

  const hashedPassword = await hashPassword(password);

  customers = new Customers({ name, email, phone, address, password: hashedPassword, paymentPreference });
  await customers.save();

  res.status(201).json({
    message: "Customer created successfully",
    success: true,
    statusCode: 201,
    customers,
  });
});

// @ Update Customer Details All at once
export const updateCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, address, password } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError("Invalid Customer ID", 400));
  }

  const validationResult = verifyData({ name, email, phone, address, password });

  if (!validationResult.success) {
    return next(createError(validationResult.message, 403));
  }

  const hashedPassword = await hashPassword(password);

  let retailer = await Customers.findByIdAndUpdate(id, { $set: { name, email, phone, address, password: hashedPassword } }, { new: true, timestamps: true });

  if (!retailer) {
    return next(createError(`Customer with ID: ${id} not found!`, 404));
  }

  console.log(retailer);

  res.status(200).json({
    message: "Customer Data Updated successfully",
    success: true,
    statusCode: 200,
    retailer,
  });

});


// @ Patch Update customer details
export const updateCustomerColumn = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, address, password, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError("Invalid Customer ID", 400));
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (phone) updateFields.phone = phone;
  if (address) updateFields.address = address;
  if (password) updateFields.password = password;
  if (isActive) updateFields.isActive = isActive;

  const validationResult = verifyData(updateFields);

  if (!validationResult.success) {
    return next(createError(validationResult.message, 403));
  }

  if (password) updateFields.password = await hashPassword(password);

  const customers = await Customers.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true });

  if (!customers) {
    return next(createError(`Customer with ID: ${id} not found!`, 404));
  }

  console.log(customers);

  res.status(200).json({
    message: "Customers data updated successfully",
    success: true,
    statusCode: 200,
    columnsUpdated: Object.keys(updateFields),
  });

});

// @ delete customers
export const deleteCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError("Invalid Customer ID", 404));
  }

  const customers = await Customers.findByIdAndDelete(id);

  if (!customers) {
    return next(createError(`Customer with Id: ${id} not found`, 404));
  }

  res.status(200).json({
    message: `Customer with Id: ${id} deleted successfully`,
    success: true,
    statusCode: 200,
  });

});