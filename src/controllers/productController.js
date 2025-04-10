import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import Products from "../models/products/productModel.js";
import { verifyData } from "../utils/verifyData.js";
import mongoose, { Mongoose } from "mongoose";
import Suppliers from "../models/suppliers/suppliersModel.js";
import Category from "../models/category/categoryModel.js";

export const getProducts = asyncHandler(async (req, res, next) => {
    const products = await Products.find();

    if (products.length === 0) {
        return next(createError("There are no Products found", 404));
    }

    res.status(200).json({
        message: `There are ${products.length} were found`,
        success: true,
        statusCode: 200,
        products,
    });
});

export const getSingleProduct = asyncHandler(async (req, res, next) => {
    const productId = req.params.productId;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return next(createError("Product ID is missing or Invalid ID", 400));
    }

    const getProduct = await Products.findById(productId).select("_id name categoryId supplierId pricePerItem");
    if (!getProduct) {
        return next(createError(`The Product with this ID ${productId} does not found`, 404));
    }

    res.status(200).json({
        message: "Products is found",
        success: true,
        statusCode: 200,
        product: getProduct
    })
});

export const getQueriedProducts = asyncHandler(async (req, res, next) => {
    const { supplierId, categoryId } = req.query;

    if (!supplierId && !categoryId) {
        return next(createError("Supplier ID or category ID is required", 400));
    }

    const [checkSupplier, checkCategory] = await Promise.all([
        supplierId ? Suppliers.findById(supplierId) : null,
        categoryId ? Category.findById(categoryId) : null,
    ]);

    if (supplierId && !checkSupplier) {
        return next(createError(`Supplier with Id: ${supplierId} does not exist`, 400));
    }

    if (categoryId && !checkCategory) {
        return next(createError(`Category with Id: ${categoryId} does not exits`, 400));
    }

    let dynamicQuery = {};
    if (supplierId) dynamicQuery.supplierId = supplierId;
    if (categoryId) dynamicQuery.categoryId = categoryId;


    const products = await Products.find(dynamicQuery);
    if (products.length <= 0) {
        return next(createError("There are no products found", 404));
    }

    res.status(200).json({
        message: `There are ${products.length} products found`,
        success: true,
        statusCode: 200,
        products,
    });
});

export const addProducts = asyncHandler(async (req, res, next) => {

    const allProducts = req.body.products;

    if (!Array.isArray(allProducts) || allProducts.length === 0) {
        return next(createError("products need to be in an array with values", 400))
    }

    let finalProduct = [];

    for (let products of allProducts) {
        let { name, supplierId, categoryId, pricePerItem } = products;
        products.name = products.name.trim().toLowerCase();

        if (!mongoose.Types.ObjectId.isValid(supplierId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return next(createError(`${name}: Supplier Id or Category Id is invalid`, 400));
        }

        const supplierExists = await Suppliers.findById(supplierId);
        if (!supplierExists) {
            return next(createError(`Supplier with this Id: ${supplierId} does not exist`, 400));
        }

        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return next(createError(`Category with this Id: ${categoryId} does not exist`, 400));
        }

        products.pricePerItem = parseFloat(products.pricePerItem);
        if (isNaN(products.pricePerItem)) {
            return next(createError("PricePerItem must be a number", 400));
        }

        const verificationResult = verifyData({ name, pricePerItem });
        if (!verificationResult.success) {
            return next(createError(verificationResult.message, 400));
        }

        const existingProduct = await Products.findOne({
            supplierId: products.supplierId,
            categoryId: products.categoryId,
            name: products.name,
        });

        if (existingProduct) {
            return next(createError(`Product ${products.name} already exist in the same supplierID ${products.supplierId} and categoryID ${products.categoryId} `, 400));
        }

        finalProduct.push(products);
    }

    const newProduct = await Products.insertMany(finalProduct);
    if (!newProduct) {
        return next(createError("Product insertion failed", 403));
    }

    res.status(201).json({
        message: "Product Inserted Successfully",
        success: true,
        statusCode: 201,
        products: newProduct,
    })
});

export const updateAllProducts = asyncHandler(async (req, res, next) => {
    const updatedProducts = req.body.products;

    if (!Array.isArray(updatedProducts) || updatedProducts.length === 0) {
        return next(createError("products need to be an array with values", 400));
    }

    let finalProduct = [];

    for (let product of updatedProducts) {
        let { name, supplierId, categoryId, pricePerItem } = product;
        product.name = name.toLowerCase();

        if (!mongoose.Types.ObjectId.isValid(supplierId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return next(createError("The supplier Id or category Id is Invalid", 400));
        }

        const supplierExists = await Suppliers.findById(supplierId);
        if (!supplierExists) {
            return next(createError(`Supplier with this Id: ${supplierId} does not exist`, 400));
        }

        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return next(createError(`Category with this Id: ${categoryId} does not exist`, 400));
        }

        product.pricePerItem = parseFloat(pricePerItem);
        if (isNaN(product.pricePerItem)) {
            return next(createError("PricePerItem must be a number", 400));
        }

        console.log(product)

        const verificationResult = verifyData({ name: product.name, pricePerItem: product.pricePerItem });
        if (!verificationResult.success) {
            return next(createError(verificationResult.message, 400));
        }

        const existingProduct = await Products.findOne({
            supplierId: product.supplierId,
            categoryId: product.categoryId,
            name: product.name
        });

        console.log(existingProduct);
        if (!existingProduct) {
            return next(createError(`The product ${name} with supplier id ${supplierId} and category id: ${categoryId} does not exist`));
        }

        finalProduct.push({
            updateOne: {
                filter: { _id: existingProduct._id },
                update: { $set: product }
            }
        });
    };

    const updateResult = await Products.bulkWrite(finalProduct);
    if (!updateResult.modifiedCount) {
        return next(createError("No products were updated", 403));
    }

    res.status(200).json({
        message: "Product Updated Successfully",
        success: true,
        statusCode: 200,
        modifiedCount: updateResult.modifiedCount,
    })
});

export const deleteProducts = asyncHandler(async (req, res, next) => {
    const deletingProducts = req.body.products;

    if (!Array.isArray(deletingProducts) || deletingProducts.length === 0) {
        return next(createError("Products array is required and must have values", 400));
    }

    console.log(deletingProducts);
    const deleteResults = await Promise.allSettled(
        deletingProducts.map(async (productId) => {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return { status: "rejected", reason: `Invalid Product Id: ${productId}` };
            }
            console.log(await Products.findById(productId));

            const deletedProduct = await Products.findByIdAndDelete(productId);

            console.log(deletedProduct)
            if (!deletedProduct) {
                return { status: "rejected", reason: `Product with ID: ${productId} does not found` };
            }

            return { status: "resolved", value: deletedProduct };
        })
    );

    const deletedProducts = deleteResults
        .filter(result => result.status === "resolved")
        .map(result => result.value);

    const failedDeletions = deleteResults
        .filter(result => result.status === "rejected")
        .map(result => result.reason);

    if (!deletedProducts.length === 0) {
        return next(createError("No Products were deleted", 404));
    }

    res.status(200).json({
        message: "Product deleted successfully",
        success: true,
        statusCode: 200,
        deletedProducts,
        failedDeletions,
    });
});