import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import Products from "../models/products/productModel.js";
import { verifyData } from "../utils/verifyData.js";
import mongoose, { Mongoose } from "mongoose";
import Suppliers from "../models/suppliers/suppliersModel.js";

export const getProducts = asyncHandler(async (req, res, next) => {
    const products = await Products.find();

    if (products.length === 0) {
        return next(createError("There are no Products found", 404));
    }

    res.status(200).json({
        message: "Products found",
        success: true,
        statusCode: 200,
        products,
    });
});

export const getSupplierProducts = asyncHandler(async (req, res, next) => {
    const { supplierId, categoryId } = req.query;

    let supplier = "";
    let products = "";

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        return next(createError("Invalid Id of supplier", 400));
    } else {
        supplier = await Suppliers.findById(supplierId);
        if (!supplier) {
            return next(createError(`No Supplier found in this Id: ${supplierId}`, 404));
        }

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return next(createError("Invalid Id of supplier", 400));
        } else {
            products = await Products.find({ supplierId, categoryId });
            if (products.length === 0) {
                return next(createError("There are no Products found by this supplier", 404));
            }
        }

        products = await Products.find({ supplierId });
        if (products.length === 0) {
            return next(createError("There are no Products found by this supplier", 404));
        }
    }

    res.status(200).json({
        success: true,
        supplier,
        products,
    })
})

// export const getSupplierProducts = asyncHandler(async (req, res, next) => {
//     const { supplierId } = req.params;

//     if(!mongoose.Types.ObjectId.isValid(supplierId)){
//         return next(createError("Invalid Id of supplier", 400));
//     }

//     const supplier = await Suppliers.findById(supplierId);
//     if(!supplier) {
//         return next(createError(`No Supplier found in this Id: ${supplierId}`, 404));
//     }

//    let products = await Products.find({ name, supplierId });
//    if (products.length > 0) return next(createError(`The products with the name ${name} already exist in this supplier`, 400));
//    

//     products = await Products.find({ supplierId });
//     if(products.length === 0) {
//         return next(createError("There are no Products found by this supplier", 404));
//     }

//     res.status(200).json({
//         success: true,
//         supplier,
//         products,
//     })
// })

// export const addProducts = asyncHandler(async (req, res, next) => {
//     const { supplierId, name, categoryId } = req.body;

//     let pricePerItem = parseFloat(req.body.pricePerItem);
//     if (isNaN(pricePerItem)) {
//         return next(createError("pricePerItem must be a number", 400));
//     }

//     if (!mongoose.Types.ObjectId.isValid(supplierId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
//         return next(createError("Invalid Supplier or Category ID", 400));
//     };

//     const verificationResult = verifyData({ name, pricePerItem });
//     if (!verificationResult.success) {
//         return next(createError(verificationResult.message, 403));
//     }

//     let products = await Products.find({ name, supplierId });
//     if (products.length > 0) return next(createError(`The products with the name ${name} already exist in this supplier`, 400));

//     products = new Products({ supplierId, name, categoryId, pricePerItem });
//     await products.save();


//     res.status(201).json({
//         message: "Products added successfully",
//         success: true,
//         statusCode: 201,
//         products
//     });
// });

export const addProducts = asyncHandler(async (req, res, next) => {
    const allProducts = req.body.products;

    if (!Array.isArray(allProducts) || allProducts.length === 0) {
        return next(createError("Products need to be an array with values", 400));
    }

    const invalidEntries = [];
    const validEntries = [];

    await Promise.all(allProducts.map(async (product) => {
        const { supplierId, name, categoryId, pricePerItem } = product;

        const price = parseFloat(pricePerItem);
        if (!pricePerItem || isNaN(price)) {
            return invalidEntries.push({ name, error: "pricePerItem must be a valid number" });
        }

        const verificationResult = verifyData({ supplierId, name, categoryId, pricePerItem });
        if(!verificationResult.success) {
            return invalidEntries.push({ name, error: verificationResult.message });
        }

        let newProduct = await Products.find({ supplierId, name, categoryId});
        if(newProduct.length > 0){
            return invalidEntries.push({ name, entries: "Product with name, supplier and category already found in the db"});
        }

        newProduct = await Products.create({ supplierId, name, categoryId, pricePerItem: price });
        validEntries.push(newProduct);
    }));

    let statusCode, message, success;
    if (validEntries.length === 0) {
        return next(createError("All products insertion failed", 400));
    } else if (invalidEntries.length === 0) {
        statusCode = 200;
        message = "All products inserted successfully";
        success = true;
    } else {
        statusCode = 207;
        message = "Some products inserted, some failed";
        success = true;
    }

    res.status(statusCode).json({
        message,
        success,
        statusCode,
        validEntries,
        invalidEntries,
    });
});
