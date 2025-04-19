import mongoose from "mongoose";

const feedbackSchema = mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers",
        required: function () {
            return this.senderType === "customer";
        },
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: function () {
            return this.senderType === "staff";
        },
    },
    senderType: {
        type: String,
        enum: ["customer", "staff"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
