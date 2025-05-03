import jwt from "jsonwebtoken";
import { createError } from "../utils/errorUtils.js";
import Admin from "../models/admin/adminModel.js";
import Customers from "../models/customers/customerModel.js";
import { asyncHandler } from "./asyncHandler.js";

// To verify the user JWT token
export const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(createError("No token provided", 403));
    }

    try {

        if (!process.env.JWT_TOKEN) {
            return next(createError("No JWT secret provided", 500));
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);


        const userId = decoded.id;
        const isAdmin = decoded.isAdmin;

        if (isAdmin) {
            const admin = await Admin.findById(userId).select("-password");
            if (!admin) {
                return next(createError("Admin user not found", 404));
            }
            req.admin = admin;
        } else {
            const customer = await Customers.findById(userId).select("-password");
            if (!customer) {
                return next(createError("Customer not found", 404));
            }
            req.customers = customer;
        }

        req.isAdmin = isAdmin;

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(createError("Session expired, please login again", 401));
        }
        if (err.name === "JsonWebTokenError") {
            return next(createError("Invalid token, please login again", 401));
        }
        return next(createError("Authentication failed", 403));
    }
});

// if the user is customer, then it pass to next and check if the user is admin.
export const adminAccess = (req, res, next) => {
    if (!req.admin) {
        return next(createError("Access denied. Admins only.", 403));
    }
    next();
};
