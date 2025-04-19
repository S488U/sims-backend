import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import mongoose from "mongoose";
import Feedback from "../models/feedback/feedbackModel.js";
import { verifyData } from "../utils/verifyData.js";

export const getFeedback = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        message: "On work",
    })
});

export const addFeedback = asyncHandler(async (req, res, next) => {
    const { customerId, staffId, senderType, message } = req.body;

    let query = {};
    if (customerId) {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return next(createError(`The Customer ID: ${customerId} is not a valid Id`, 400));
        }
        query.customerId = customerId;
    }

    if (staffId) {
        if (!mongoose.Types.ObjectId.isValid(staffId)) {
            return next(createError(`The Staff ID: ${staffId} is not a valid Id`, 400));
        }
        query.staffId = staffId;
    }

    if (!query.customerId && !query.staffId) {
        return next(createError("Either customerId or staffId is required", 400));
    }

    if (!senderType || !message) {
        return next(createError("All fields are required", 400));
    }

    const validateSender = ["customer", "staff"];
    const lowerCasedSenderType = senderType.toString().trim().toLowerCase();
    if (!validateSender.includes(lowerCasedSenderType)) {
        return next(createError(`The sender type: ${senderType} is not valid and it only include these values: ${validateSender}`, 400));
    }

    query.senderType = lowerCasedSenderType;

    const validateMessage = verifyData({ feedback: message.trim() });
    if (!validateMessage.success) {
        return next(createError(validateMessage.message, 400));
    }

    query.message = message.trim();

    const feedback = Feedback(query);
    await feedback.save();

    res.status(201).json({
        message: "Feedback added successfully",
        success: true,
        statusCode: 201,
        feedback,
    });
});