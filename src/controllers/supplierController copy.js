import mongoose from "mongoose";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Suppliers from "../models/suppliers/suppliersModel.js";
import { createError } from "../utils/errorUtils.js";
import { verifyData } from "../utils/verifyData.js";

export const getSupplier = asyncHandler(async (req, res, next) => {
    const supplier = await Suppliers.find();

    if (supplier.length === 0) {
        return next(createError("No suppliers found", 404));
    }

    res.status(200).json({
        message: "Suppliers found",
        success: true,
        statusCode: 200,
        supplier
    });
});

export const getSingleSupplier = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError("Invalid User ID", 400));
    }

    const supplier = await Suppliers.findById(id);
    if (!supplier) {
        return next(createError(`No Supplier found in this Id: ${id}`, 404));
    }

    res.status(200).json({
        message: "Supplier found successfully",
        success: true,
        statusCode: 200,
        supplier,
    });
});

export const addSupplier = asyncHandler(async (req, res, next) => {
    const { name, email, phone, address } = req.body;

    const validationResult = verifyData({ name, email, phone, address });

    if (!validationResult.success) {
        return next(createError(validationResult.message, 403));
    }

    let supplier = await Suppliers.findOne({ email });
    if (supplier) {
        return next(createError("Supplier with same mail id already exist", 403));
    }

    supplier = new Suppliers({ name, email, phone, address });
    await supplier.save();

    res.status(201).json({
        message: "Supplier added successfully",
        success: true,
        statusCode: 201,
        supplier,
    });
});

export const updateAllSupplier = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError("Invalid Suppliers Id", 400));

    const verificationResult = verifyData({ name, email, phone, address });
    if (!verificationResult.success) return next(createError(verificationResult.message, 403));

    // let supplier = await Suppliers.findById(id);
    // if (!supplier) return next(createError(`Supplier with Id: ${id} does not found`, 404));

    let supplier = await Suppliers.findByIdAndUpdate(id,
        { $set: { name, email, phone, address } },
        { new: true, timestamps: true },
    );

    if (!supplier) return next(createError(`Supplier with Id: ${id} does not found`, 404));

    res.status(200).json({
        message: "Supplier updated successfully",
        success: true,
        statusCode: 200,
        supplier,
    });
});

export const updateSupplierColumn = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    let updatedFields = {};
    if (name) updatedFields.name = name;
    if (phone) updatedFields.phone = phone;
    if (email) updatedFields.email = email;
    if (address) updatedFields.address = address;

    if (Object.keys(updatedFields).length === 0) return next(createError("No data provided", 400));

    const validationResult = verifyData(updatedFields);
    if (!validationResult.success) return next(createError(validationResult.message, 403));

    const supplier = await Suppliers.findByIdAndUpdate(id,
        { $set: updatedFields },
        { new: true, runValidators: true },
    );

    if (!supplier) return next(createError(`Supplier with id: ${id} not found`, 404));

    res.status(200).json({
        message: "Supplier Updated successfully",
        success: true,
        statusCode: 200,
        supplier,
    });
});

export const deleteSupplier = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError("Invalid Supplier Id", 400));

    const supplier = await Suppliers.findByIdAndDelete(id);
    if (!supplier) return next(createError(`Supplier with id: ${id} does not found`, 400));

    res.status(200).json({
        message: "Supplier deleted successfully",
        success: true,
        statusCode: 200,
    });
});