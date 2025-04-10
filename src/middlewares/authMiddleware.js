import jwt from "jsonwebtoken";
import { createError } from "../utils/errorUtils.js";
import Admin from "../models/admin/adminModel.js";
import Customers from "../models/customers/customerModel.js";
import { asyncHandler } from "./asyncHandler.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(createError("No Token Provided", 403));
    }

    try {
        if (!process.env.JWT_TOKEN) return next(createError("No JWT token provided, 404"));
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
        console.log(decodedToken);

        if (decodedToken.isAdmin) {
            req.admin = await Admin.findById(decodedToken.id).select("-password");
            console.log(req.admin);
            if (!req.admin) {
                return next(createError("No Admin found", 404));
            }

        } else {
            req.customers = await Customers.findById(decodedToken.id).select("-password");
            console.log(req.customers);
            if (!req.customers) {
                return next(createError("No customers found", 404));
            }
        }

        next();
    } catch (err) {
        next(createError("Invalid or expired token", 403));
    }
});

export const adminAccess = (req, res, next) => {
    console.log("passed");
    console.log(req.admin);
    if (!req.admin) {
        return next(createError("Access denied admins only", 403));
    }

    next();
};