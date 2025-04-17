import mongoose from "mongoose";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Suppliers from "../models/suppliers/suppliersModel.js";
import { createError } from "../utils/errorUtils.js";
import { verifyData } from "../utils/verifyData.js";

export const getSupplier = asyncHandler(async (req, res, next) => {
    const supplier = await Suppliers.find().select("-__v");

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

// @ POST: /api/supplier/
export const addSupplier = asyncHandler(async (req, res, next) => {
    let { name, email, phone, address, products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
        return next(createError("products need to be an array with values", 400));
    }

    if (!name || !email || !phone || !address) {
        return next(createError("All fields are compulsory", 404));
    }

    name = name.trim().toLowerCase();
    phone = phone.trim();

    const validationResult = verifyData({ name, email, phone, address });
    if (!validationResult.success) {
        return next(createError(validationResult.message, 400));
    }

    const duplicateCheckSet = new Set();

    for (const [index, item] of products.entries()) {
        const priceItem = parseFloat(item.pricePerItem);
        item.pricePerItem = priceItem;

        if (isNaN(item.pricePerItem)) {
            return next(createError(`Product index: ${index}: PricePerItem must be a number`, 400));
        }

        item.name = item.name.trim().toLowerCase();
        item.category = item.category.trim().toLowerCase();

        const key = `${item.name}|${item.category}`;
        if (duplicateCheckSet.has(key)) {
            return next(createError(`Product index ${index}: Duplicate name and category`, 400));
        }
        duplicateCheckSet.add(key);

        const result = verifyData({
            productName: item.name, 
            category: item.category,
            pricePerItem: item.pricePerItem,
        });

        if (!result.success) {
            return next(createError(`Product Index ${index}: ${result.message}`, 400));
        }
    }

    let supplier = await Suppliers.findOne({ email });
    if (supplier) {
        return next(createError("Supplier with same mail id already exist", 403));
    }

    supplier = new Suppliers({ name, email, phone, address, products });
    await supplier.save();

    supplier = supplier.toObject();
    delete supplier.__v;

    res.status(201).json({
        message: "Supplier added successfully",
        success: true,
        statusCode: 201,
        supplier,
    });
});


export const updateAllSupplier = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, phone, email, address, products } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError("Invalid Suppliers Id", 400));

    let supplier = await Suppliers.findById(supplierId);
    if (!supplier) {
        return next(createError(`Supplier with Id: ${id} does not found`, 404));
    }

    if (!Array.isArray(products) || products.length === 0) {
        return next(createError("products need to be an array with values", 400));
    }

    if (!name || !email || !phone || !address) {
        return next(createError("All fields are compulsory", 404));
    }

    name = name.trim().toLowerCase();
    phone = phone.trim();

    const verificationResult = verifyData({ name, email, phone, address });
    if (!verificationResult.success) return next(createError(verificationResult.message, 403));

    let duplicateCheckSet = new Set();
    for (const [index, item] of products.entries()) {
        const priceItem = parseFloat(item.pricePerItem);
        item.pricePerItem = priceItem;
        if (isNaN(item.pricePerItem)) {
            return next(createError(`Product index: ${index}: PricePerItem must be a number`, 400));
        }

        item.name = item.name.trim().toLowerCase();
        item.category = item.category.trim().toLowerCase();

        const key = `${item.name}|${item.category}`;
        if (duplicateCheckSet.has(key)) {
            return next(createError(`Product index ${index}: Duplicate name and category`, 400));
        }
        duplicateCheckSet.add(key);

        const result = verifyData({ productName: item.name, category: item.category, pricePerItem: item.pricePerItem });
        if (!result.success) return next(createError(`Product Index ${index}: ${result.message}`, 400));
    }

    supplier.name = name;
    supplier.email = email;
    supplier.phone = phone;
    supplier.address = address;
    supplier.products = products;

    await supplier.save();
    supplier = supplier.toObject();
    delete supplier.__v;

    res.status(200).json({
        message: "Supplier updated successfully",
        success: true,
        statusCode: 200,
        supplier,
    });
});

const processHandler = (fieldValue, fieldName, options = {}) => {
    if (fieldValue === undefined) return undefined;
    let value = fieldValue.trim();
    if (options.lowercase) value = value.toLowerCase();
    if (value === "") {
        throw createError(`${fieldName} cannot be empty`, 400);
    }
    return value;
}

// @ PATCH: Update Supplier, Products
export const updateSupplierDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let { name, email, phone, address, products, deleteProducts } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(`Invalid Supplier Id: ${id}`, 400));
    }

    let getSupplier = await Suppliers.findById(id);
    if (!getSupplier) return next(createError(`Supplier not found in this id: ${id}`, 404));

    let updatedFields = {};

    if (name) updatedFields.name = processHandler(name, "Name", { lowercase: true });
    if (address) updatedFields.address = processHandler(address, "Address");
    if (email) updatedFields.email = processHandler(email, "Email");
    if (phone) updatedFields.phone = processHandler(phone, "Phone");

    if (Object.keys(updatedFields).length > 0) {
        const result = verifyData(updatedFields);
        if (!result.success) {
            return next(createError(result.message, 400));
        }
    }

    if (products !== undefined) {
        if (!Array.isArray(products)) {
            return next(createError("Products must be an array", 400));
        }

        const duplicateCheckSet = new Set();

        for (const [index, item] of products.entries()) {
            if (item.productId) {
                if (!mongoose.Types.ObjectId.isValid(item.productId)) {
                    return next(createError(`Invalid product ID at index ${index}: ${item.productId}`, 400));
                }

                const existingProduct = getSupplier.products.id(item.productId);
                if (!existingProduct) {
                    return next(createError(`No product found in supplier with ID: ${item.productId}`, 404));
                }

                const price = parseFloat(item.pricePerItem);
                if (isNaN(price)) {
                    return next(createError(`Product index ${index}: pricePerItem must be a number`, 400));
                }

                item.name = processHandler(item.name, "Name", { lowercase: true });
                item.category = processHandler(item.category, "Category", { lowercase: true });
                item.pricePerItem = price;

                const key = `${item.name}|${item.category}`;
                if (duplicateCheckSet.has(key)) {
                    return next(createError(`Product index ${index}: Duplicate name + category`, 400));
                }
                duplicateCheckSet.add(key);

                const result = verifyData({
                    productName: item.name,
                    category: item.category,
                    pricePerItem: item.pricePerItem,
                });

                if (!result.success) {
                    return next(createError(`Product Index ${index}: ${result.message}`, 400));
                }

                existingProduct.name = item.name;
                existingProduct.category = item.category;
                existingProduct.pricePerItem = price;
            } else {
                const newProduct = {
                    name: processHandler(item.name, "Name", { lowercase: true }),
                    category: processHandler(item.category, "Category", { lowercase: true }),
                    pricePerItem: parseFloat(item.pricePerItem),
                };

                const result = verifyData({
                    productName: newProduct.name,
                    category: newProduct.category,
                    pricePerItem: newProduct.pricePerItem,
                });

                if (!result.success) {
                    return next(createError(`New Product index ${index}: ${result.message}`, 400));
                }

                const key = `${newProduct.name}|${newProduct.category}`;
                if (duplicateCheckSet.has(key)) {
                    return next(createError(`New Product index ${index}: Duplicate name + category`, 400));
                }
                duplicateCheckSet.add(key);

                getSupplier.products.push(newProduct);
            }
        }
    }

    if (deleteProducts !== undefined) {
        if (!Array.isArray(deleteProducts) || deleteProducts.length === 0) {
            return next(createError("deleteProducts must be a non-empty array", 400));
        }

        const idSet = new Set();
        for (const [index, productId] of deleteProducts.entries()) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return next(createError(`Invalid product ID at delete index ${index}`, 400));
            }
            if (idSet.has(productId)) {
                return next(createError(`Delete Product index ${index}: Duplicate product ID`, 400));
            }
            idSet.add(productId);
        }

        getSupplier.products = getSupplier.products.filter(
            (product) => !idSet.has(product._id.toString())
        );
    }

    Object.assign(getSupplier, updatedFields);

    await getSupplier.save();

    res.status(200).json({
        success: true,
        message: "Supplier updated successfully",
        statusCode: 200,
        data: getSupplier,
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

    const validationResult = verifyData({ productName: name, phone, email, address });
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