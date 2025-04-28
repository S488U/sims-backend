import mongoose from "mongoose";

const reportSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null,
    },
    type: {
        type: String,
        enum : ["inventory", "invoice", "category", "sales", "orders"],
        required: true
    },
    dateRange: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    chartData: {
        type: Array,
        default: [],
    },
    dataDetails: {
        type: Object,
        default: {},
    },
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;