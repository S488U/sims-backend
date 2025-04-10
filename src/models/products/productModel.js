import mongoose from "mongoose";

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

productSchema.index({ name: 1, supplierId: 1, categoryId: 1 }, { unique: true });

const Products = mongoose.model("Products", productSchema);
export default Products;