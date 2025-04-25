import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Invoice from "../models/invoice/invoiceModel.js";
import Customers from "../models/customers/customerModel.js";
import Order from "../models/order/orderModel.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const IST_TIMEZONE = "Asia/Kolkata";

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

const calculateDueDate = (preference) => {
    const dueDays = preference === "weekly" ? 4 : 7;
    return dayjs().tz(IST_TIMEZONE).add(dueDays, "day").utc().toDate();
};

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

export const getInvoiceByCustomer = asyncHandler(async (req, res, next) => {
    const { customerId, invoiceId } = req.query;

    let query = {};
    if (customerId !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return next(createError("Invalid Customer ID", 400));
        }
        query.customerId = customerId;
    }

    if (invoiceId !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return next(createError("Invalid Invoice ID", 400));
        }
        query._id = invoiceId;
    }

    const invoice = await Invoice.find(query).select("-__v");
    if (!invoice || invoice.length === 0) {
        return next(createError("No invoice Found in this customer", 404));
    }
    res.status(200).json({
        message: `Invoices found in this customer ${customerId}`,
        success: true,
        statusCode: 200,
        invoice
    });
})

export const generateInvoice = asyncHandler(async (req, res, next) => {
    const { customers } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
        return next(createError("Customers need to be an array with valid IDs", 400));
    }

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
    }

    res.status(201).json({
        message: "Invoices generated successfully based on IST",
        success: true,
        statusCode: 201
    });
});

export const approveInvoice = asyncHandler(async (req, res, next) => {
    const { invoiceId } = req.params;
    const { draftInvoice } = req.body;

    if(invoiceId === undefined) {
        return next(createError("No invoice Id", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
        return next(createError("Invalid Invoice ID", 400));
    }

    if(!draftInvoice == undefined) {
        return next(createError("No draftInvoice value", 400));
    }

    let status = draftInvoice === false ? "pending" : "draft";

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice || invoice.length === 0) {
        return next(createError("No invoice Found in this customer", 404));
    }

    invoice.draft = draftInvoice;
    invoice.status = status;
    await invoice.save();

    res.status(200).json({
        message: "Invoice Draft Upadated Successfully",
        success: true,
        statusCode: 200,
        invoice
    })
})