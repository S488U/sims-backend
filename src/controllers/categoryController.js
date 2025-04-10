import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import { verifyData } from "../utils/verifyData.js";
import Category from "../models/category/categoryModel.js";
import mongoose from "mongoose";

export const getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.find();
    if (Object.keys(category).length === 0) {
        return next(createError("There is no category found", 404));
    }

    res.status(200).json({
        message: "Category found",
        success: true,
        statusCode: 200,
        category,
    });
});

export const addCategory = asyncHandler(async (req, res, next) => {
    let { name, description } = req.body;

    name = name.toLowerCase();

    const validationResult = verifyData({ categoryName: name, description });
    if (!validationResult.success) return next(createError(validationResult.message, 403));

    let category = await Category.findOne({ name });
    if (category) return next(createError("Category already exist", 409));

    category = new Category({ name, description });
    await category.save();

    res.status(201).json({
        message: "Category created successfully",
        success: true,
        statusCode: 201,
        category,
    });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { description } = req.body;
    let name = req.body.name.toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError("Invalid Category Id", 400));

    let updatedFields = {};
    if (name) updatedFields.name = name;
    if (description) updatedFields.description = description;

    const validationResult = verifyData(updatedFields);
    if (!validationResult.success) return next(createError(validationResult.message, 403));

    const category = await Category.findByIdAndUpdate(id,
        { $set: updatedFields },
        { new: true, runValidators: true }
    );

    if(!category) return next(createError(`No Category found in this Id: ${id}`, 404));

    res.status(200).json({
        message: "Category update successfully",
        success: true, 
        statusCode: 200,
        updatedFields,
    });
});

export const deleteCategory = asyncHandler(async (req, res, next) => { 
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) return next(createError("Invalid Category Id", 400));

    const category = await Category.findById(id);
    if(!category) return next(createError(`No category found with id: ${id}`, 404));

    // await Product.updateMany({ category: id }, { $unset: { category: "" } });

    await category.deleteOne();

    res.status(200).json({
        message: "Category Deleted",
        success: true,
        statusCode: 200,
    });
});