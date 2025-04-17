import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import mongoose from "mongoose";
import Inventory from "../models/inventory/inventoryModel.js";
import Suppliers from "../models/suppliers/suppliersModel.js";

// @ GET: /api/inventory
export const getInventory = asyncHandler(async (req, res, next) => {
    const inventory = await Inventory.find().select("-__v");
    if (inventory.length === 0) {
        return res.status(200).json({ message: "Inventory is empty", success: true, statusCode: 200 });
    }

    res.status(200).json({
        message: `In inventory ${inventory.length} were found`,
        success: true,
        statusCode: 200,
        inventory,
    })
});

// @ GET: /api/inventory/:inventoryId
export const getSingleInventory = asyncHandler(async (req, res, next) => {
    const { inventoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
        return next(createError("Invalid Inventory ID", 400));
    }

    const inventory = await Inventory.findById(inventoryId).select("-__v");
    if (!inventory) {
        return next(createError(`No inventory found in this id: ${inventoryId}`, 404));
    }

    res.status(200).json({
        message: "Inventory found",
        success: true,
        statusCode: 200,
        inventory,
    });
});

// @ GET: /api/inventory/customer
export const getInventoryByCustomer = asyncHandler(async (req, res, next) => {
    const inventory = await Inventory.find().select("-__v -productId -supplierId -supplierName");
    if (inventory.length === 0) {
        return res.status(200).json({ message: "Inventory is empty", success: true, statusCode: 200 });
    }

    res.status(200).json({
        message: `In inventory ${inventory.length} were found`,
        success: true,
        statusCode: 200,
        inventory,
    })
});

// @ POST: /api/inventory
export const addInventory = asyncHandler(async (req, res, next) => {
    const { supplierId, productId, threshold, quantity } = req.body;

    if (!supplierId || !productId || !threshold || !quantity) {
        return next(createError("All fields are required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(supplierId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return next(createError("Invalid Supplier or Product ID", 400));
    }

    const parsedThreshold = parseInt(threshold);
    if (isNaN(parsedThreshold)) {
        return next(createError("Threshold Must be a number", 400));
    }

    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity)) {
        return next(createError("Quantity Must be a number", 400));
    }

    const getSupplier = await Suppliers.findById(supplierId);
    if (!getSupplier) {
        return next(createError(`Supplier not found in this ID : ${supplierId}`, 404));
    }

    const productExist = getSupplier.products.find(product => product._id.toString() === productId);
    if (!productExist) {
        return next(createError(`Product not found in supplier's product list`, 404));
    }

    const supplierName = getSupplier.name;
    const productName = productExist.name;
    const category = productExist.category;
    const productPrice = productExist.pricePerItem;

    const existingInventory = await Inventory.findOne({ supplierId, productId });

    let inventory;

    if (existingInventory) {
        existingInventory.quantity += newQuantity;
        existingInventory.threshold = parsedThreshold;
        await existingInventory.save();
        
        inventory = existingInventory;
    } else {
        const newInventory = new Inventory({ supplierId, supplierName, productId, productName, category, productPrice, quantity: newQuantity, threshold: parsedThreshold });
        await newInventory.save();
        
        inventory = newInventory;
    }

    res.status(201).json({
        message: "Inventory added successfully",
        success: true,
        statusCode: 201,
        inventory
    });
});

// @ PATCH: /api/inventory/:inventoryId
export const updateInventoryColumn = asyncHandler(async (req, res, next) => {
    const { inventoryId } = req.params;
    const { quantity, threshold } = req.body;

    if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
        return next(createError("Invalid Inventory ID", 400));
    }

    if (quantity === undefined || quantity === null || quantity === "") {
        return next(createError("Quantity is required", 400));
    }

    const parsedThreshold = parseInt(threshold);
    if (isNaN(newQuantity)) {
        return next(createError("Quantity must be a valid number", 400));
    }

    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity)) {
        return next(createError("Quantity must be a valid number", 400));
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
        return next(createError(`No inventory found with ID: ${inventoryId}`, 404));
    }

    inventory.quantity = newQuantity;
    if(threshold) {
        inventory.threshold = parsedThreshold;
    }

    await inventory.save();

    res.status(200).json({
        message: "Inventory updated successfully",
        success: true,
        statusCode: 200,
        inventory,
    });
});

// @ DELETE: /api/inventory/:inventoryId
export const deleteInventory = asyncHandler(async (req, res, next) => {
    const { inventoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
        return next(createError(`Invalid Inventory ID: ${inventoryId}`, 400));
    }

    const deleteInventory = await Inventory.findByIdAndDelete(inventoryId);
    if (!deleteInventory) {
        return next(createError(`No Inventory found in this ID: ${inventoryId}`, 404));
    }

    res.status(200).json({
        message: "Inventory deleted successfully",
        success: true,
        statusCode: 200,
    });
});