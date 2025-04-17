import mongoose from "mongoose";


const inventorySchema = mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suppliers",
            required: true,
        },
        supplierName: {
            type: String,
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        productName: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        threshold: {
            type: Number,
            required: true,
            default: 50,
        },
        status: {
            type: String,
            enum: ["in_stock", "low_stock", "out_of_stock"],
            default: "in_stock",
        },
    },
    {
        timestamps: true,
    }
);

inventorySchema.pre("save", function (next) {
    if (this.quantity === 0) {
        this.status = "out_of_stock";
    } else if (this.quantity <= this.threshold) {
        this.status = "low_stock";
    } else {
        this.status = "in_stock";
    }
    next();
});


const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;