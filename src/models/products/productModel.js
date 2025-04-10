import mongoose from "mongoose";
// import Suppliers from "../suppliers/suppliersModel.js";
// import Category from "../category/categoryModel.js";

const productSchema = mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suppliers",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        pricePerItem : {
            type: Number,
            required: true,
            trim: true,
            min: 0,
        }
    },
    {
        timestamps: true,
    }
);

const Products = mongoose.model("Products", productSchema);
export default Products;