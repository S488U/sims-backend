import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Invoice from "../models/invoice/invoiceModel.js";
import Customers from "../models/customers/customerModel.js";
import Order from "../models/order/orderModel.js";
import { verifyData } from "../utils/verifyData.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const IST_TIMEZONE = "Asia/Kolkata";

// Logic for Generating Invoice by Date
const getISTDateRange = (preference = "monthly") => {
    const now = dayjs().tz(IST_TIMEZONE);

    const start = preference === "weekly"
        ? now.subtract(7, "day").startOf("day")
        : now.startOf("month").startOf("day");

    const end = now.endOf("day");

    return {
        start: start.utc().toDate(),
        end: end.utc().toDate()
    };
};

// Logic for Calcuting Due Date for monthly and weekly Paying Customer
const calculateDueDate = (preference) => {
    const dueDays = preference === "weekly" ? 4 : 7;
    return dayjs().tz(IST_TIMEZONE).add(dueDays, "day").utc().toDate();
};

// @ GET : Get All Invoices /api/invoice
export const getAllInvoice = asyncHandler(async (req, res, next) => {

    const invoice = await Invoice.find().select("-__v");

    if (!invoice || invoice.length === 0) {
        return next(createError("No invoice Found", 404));
    }

    res.status(200).json({
        message: `${invoice.length} Invoices found`,
        success: true,
        statusCode: 200,
        invoice
    })
});

// @ GET : Get A Single Invoice /api/invoice/:invoiceId
export const getSingleInvoice = asyncHandler(async (req, res, next) => {
    const { invoiceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
        return next(createError("Invalid Customer ID", 400));
    }
    const invoice = await Invoice.findById(invoiceId).select("-__v");
    if (!invoice || invoice.length === 0) {
        return next(createError("No invoice Found", 404));
    }
    res.status(200).json({
        message: "Invoice founded successfully",
        success: true,
        statusCode: 200,
        invoice
    });
})

// @ GET :  Get Invoice by customerID  /api/invoice/draft?customerId=<id>
export const getInvoiceByCustomer = asyncHandler(async(req, res, next) => {
    const { customerId } = req.params;
    
    if (customerId !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return next(createError("Invalid Customer ID", 400));
        }
    }

    const draft = false;

    const invoice = await Invoice.find({ customerId, draft }).select("-__v");
    if (!invoice || invoice.length === 0) {
        return next(createError("No invoice Found in this customer", 404));
    }
    res.status(200).json({
        message: `Invoices found in this customer ${customerId}`,
        success: true,
        statusCode: 200,
        invoice
    });
});

// @ POST : Generate Invoice for passed customers : /api/invoice/
export const generateInvoice = asyncHandler(async (req, res, next) => {
    const { customers } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
        return next(createError("Customers need to be an array with valid IDs", 400));
    }

    let invoiceCreated = false;
    let noOfInvoice = 0;

    for (const customerId of customers) {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return next(createError("Invalid Customer ID", 400));
        }

        const customer = await Customers.findById(customerId);
        if (!customer) {
            return next(createError("Customer not found", 404));
        }

        const preference = customer.paymentPreference || "monthly";
        const { start, end } = getISTDateRange(preference);

        const orders = await Order.find({
            customerId,
            status: "delivered",
            createdAt: { $gte: start, $lte: end },
            invoiceId: null
        });

        if (!orders.length) continue;

        const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const dueDate = calculateDueDate(preference);

        const invoice = new Invoice({
            customerId,
            orders: orders.map(order => order._id),
            amount: totalAmount,
            draft: true,
            status: "draft",
            dueDate
        });

        await invoice.save();

        await Order.updateMany(
            { _id: { $in: orders.map(o => o._id) } },
            { invoiceId: invoice._id }
        );

        invoiceCreated = true;
        noOfInvoice++;
    }

    if (!invoiceCreated) {
        return createError("No new invoices generated. No matching delivered orders found.", 422);
    }

    res.status(201).json({
        message: `${noOfInvoice} Invoice generated successfully based on IST`,
        success: true,
        statusCode: 201
    });
});

// @ PATCH : Approve Invoice and Update status Pending : /api/invoice/:invoiceId
export const approveInvoice = asyncHandler(async (req, res, next) => {
    const { invoiceId } = req.params;
    const { draft } = req.body;

    if (invoiceId === undefined) {
        return next(createError("No invoice Id", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
        return next(createError("Invalid Invoice ID", 400));
    }

    if (draft === undefined) {
        return next(createError("No draft value", 400));
    }

    let status = draft === false ? "pending" : "draft";

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice || invoice.length === 0) {
        return next(createError("No invoice Found in this customer", 404));
    }

    invoice.draft = draft;
    invoice.status = status;
    await invoice.save();

    res.status(200).json({
        message: "Invoice Draft Upadated Successfully",
        success: true,
        statusCode: 200,
        invoice
    })
})

// @ PATCH : Update Payment Details : /api/invoice/payment/:invoiceId
export const updatePaymentDetails = asyncHandler(async (req, res, next) => {
    const { invoiceId } = req.params;
    const { method, transId, transDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
        return next(createError("Invalid invoiceId", 400));
    }

    if (method === undefined || transDate === undefined) {
        return next(createError("All field are required: [method, transDate]"));
    }

    let invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        return next(createError(`No invoice found in this ID ${invoiceId}`, 404));
    }

    if (invoice.method !== null) return next(createError(`This Invoice cannot be modifies again. ID ${invoiceId}. Error: Payment Already updated`, 400));

    const validateMethod = new Set(["bank", "card", "upi", "cash"]);
    if (!validateMethod.has(method.trim())) {
        return next(createError("Transaction Method only allows 'bank, cash, upi, card'"));
    }

    let query = {};
    if (transDate) query.transactionDate = transDate;
    if (transId) query.transactionId = transId;

    const results = await verifyData(query);
    if (!results.success) return next(createError(results.message, 400));

    invoice.transactionDate = query.transactionDate;
    invoice.method = method;

    if (method !== "cash") {
        if (invoice.transactionId === undefined) return next(createError("Transaction ID is undefined", 400))
        invoice.transactionId = query.transactionId;
    }

    await invoice.save();

    res.status(200).json({
        message: "Invoice Payment Updated successfully",
        success: true,
        statusCode: 200,
        invoice
    });
});

// @ PATCH : Update payment status : /api/invoice/payment/status/:invoiceId
export const updateStatus = asyncHandler(async (req, res, next) => {
    const { invoiceId } = req.params;
    let status = req.body.status;

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
        return next(createError("Invalid invoice ID", 400));
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        return next(createError(`No invoice found in this ID ${invoiceId}`, 404));
    }

    if (invoice.method === null) {
        return next(createError("Invoice Payment method not need to be a null", 403));
    }

    if (status !== undefined) {
        status = status.trim().toLowerCase();
    }

    if (status !== "paid") {
        return next(createError("Status Only need to be 'paid'", 400));
    }

    invoice.status = status;
    await invoice.save();

    res.status(200).json({
        message: "Invoice Status  Updated successfully",
        success: true,
        statusCode: 200,
        invoice
    });
});

// @ DELETE : Delete Invoice : /api/invoice/:invoiceId
export const deleteInvoice = asyncHandler(async (req, res, next) => {
    const { invoiceId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
        return next(createError("No valid Id", 400));
    }

    const invoice = await Invoice.findByIdAndDelete(invoiceId);
    if (!invoice) {
        return next(createError(`No Id : ${invoiceId} found in this database`, 404));
    }

    res.status(204).send();
});