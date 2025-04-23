import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers",
        required: true,
    },
    orderProducts: [{
        inventoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        category: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        default: null,
    }
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);
export default Order;