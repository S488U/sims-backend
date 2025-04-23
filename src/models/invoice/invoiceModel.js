import mongoose from "mongoose";

const invoiceSchema = mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers",
        required: true,
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    }],
    draft: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ["paid", "pending"],
        default: "pending",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    dueDate: {
        type: Date,
        default: null,
    },
    method: {
        type: String,
        enum: ["bank", "card", "upi", "cash"],
        default: null
    },
    transactionId: {
        type: String,
        required: function () {
            return this.method && this.method !== "cash";
        },
        default: null,
    },
    transactionDate: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
