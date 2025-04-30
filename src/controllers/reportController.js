import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import Report from "../models/report/reportModel.js";
import mongoose from "mongoose";

// @ GET : /api/report  Get all the report
export const getReport = asyncHandler(async (req, res, next) => {
    const reports = await Report.find().select("-__v").sort({ createdAt: -1 });

    if (!reports || reports.length === 0) {
        return next(createError("No reports found", 404));
    }

    res.status(200).json({
        message: "Reports found successfully",
        success: true,
        statusCode: 200,
        reports
    });
});

// POSt : /api/report Add Report
export const addReport = asyncHandler(async (req, res, next) => {
    const { name, type, description, chartData, dateRange, dataDetails } = req.body;

    if (!name || !type) {
        return next(createError("Name and Type are required fields", 400));
    }

    if (
        typeof dateRange !== 'object' || dateRange === null || Array.isArray(dateRange) ||
        typeof dataDetails !== 'object' || dataDetails === null || Array.isArray(dataDetails) ||
        typeof chartData !== 'object' || chartData === null || Array.isArray(chartData)
    ) {
        return next(createError("dateRange and dataDetails need to be valid objects", 400));
    }

    const nameValue = name.trim().toLowerCase();

    const checkType = new Set(["inventory", "invoice", "category", "sales", "orders", "customers"]);
    const typeValue = type.trim().toLowerCase();

    if (!checkType.has(typeValue)) {
        return next(createError("Type needs to be a valid value"));
    }

    if (Object.keys(dateRange).length !== 2) {
        return next(createError("Date Range needs to have two objects"));
    }

    const newObject = { name: nameValue, type: typeValue, chartData, dateRange, dataDetails };
    if (description) {
        newObject.description = description.toString().trim().toLowerCase();
    }

    const report = new Report(newObject);
    await report.save();

    res.status(201).json({
        message: `Report for ${typeValue} created successfully`,
        success: true,
        statusCode: 201,
        report
    });
});

// DELETE : /api/report/:reportId Delete individual report
export const deleteReport = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError("No valid Id", 400));
    }

    const report = await Report.findByIdAndDelete(id);
    if(!report) {
        return next(createError(`This ID: ${id} is not found in the report`));
    };

    res.status(204).send();
});