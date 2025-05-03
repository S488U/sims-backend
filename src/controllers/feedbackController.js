import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createError } from "../utils/errorUtils.js";
import mongoose from "mongoose";
import Feedback from "../models/feedback/feedbackModel.js";
import { verifyData } from "../utils/verifyData.js";


// @ GET /api/feedback : Feedback for Admin. Don't have any access for Customer or others.
export const getAllFeedback = asyncHandler(async (req, res, next) => {
    const feedbacks = await Feedback.find().select("-__v");

    if (!feedbacks) {
        return next(createError("No feedbacks found", 404));
    }

    res.status(200).json({
        message: `${feedbacks.length} feedbacks found`,
        success: true,
        statusCode: 200,
        feedbacks,
    });
});

// @ GET /api/feedback/user?customerId=<id>&staffId=<id> 
// You can give two query or one single query. Both will work.
export const getFeedbacksForUsers = asyncHandler(async (req, res, next) => {
    const { staffId, customerId } = req.query;

    let query = {};
    if (customerId !== undefined || customerId !== "") {
        if (customerId) {
            if (!mongoose.Types.ObjectId.isValid(customerId)) {
                return next(createError("Invalid Customer Id", 400));
            }
            query.customerId = customerId;
        }
    }
    if (staffId !== undefined || staffId !== "") {
        if (staffId) {
            if (!mongoose.Types.ObjectId.isValid(staffId)) {
                return next(createError("Invalid Staff Id", 400));
            }
            query.staffId = staffId;
        }
    }

    if (Object.keys(query).length === 0) {
        return next(createError("Customer ID or Staff Id is needed", 400));
    };

    const feedbacks = await Feedback.find(query).select("-__v");
    if (!feedbacks || feedbacks.length === 0) {
        return next(createError("No feedbacks found", 404));
    }

    res.status(200).json({
        message: `${feedbacks.length} feedbacks found`,
        success: true,
        statusCode: 200,
        feedbacks,
    });
});

// @ POST /api/feedback : Add feedbacks
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

    const feedbacks = Feedback(query);
    await feedbacks.save();

    res.status(201).json({
        message: "Feedback added successfully",
        success: true,
        statusCode: 201,
        feedbacks,
    });
});

// @ DELETE /api/feedback : Delete feedbacks
export const deleteFeedback = asyncHandler(async (req, res, next) => {
    const { feedbackId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
        return next(createError("Invalid feedback ID", 400));
    }

    const feedback = await Feedback.findByIdAndDelete(feedbackId);
    if (!feedback) {
        return next(createError("No feedback found", 404));
    }

    res.status(200).json({
        message: "Feedback deleted successfully",
        success: true,
        statusCode: 200
    });
});