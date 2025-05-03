import jwt from "jsonwebtoken";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { verifyData } from "../utils/verifyData.js";
import { createError } from "../utils/errorUtils.js";
import { isPasswordValid } from "../utils/hashPassword.js";
import Admin from "../models/admin/adminModel.js";
import Customers from "../models/customers/customerModel.js";

// To generate JWT Token
const generateToken = (id, isAdmin) => {
    if (!process.env.JWT_TOKEN) {
        throw createError("JWT token is missing", 500);
    }

    return jwt.sign({ id, isAdmin }, process.env.JWT_TOKEN, { expiresIn: "7d" });
}

// @ POST : /login  Both login for Customers and Admin
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const verificationResult = verifyData({ email, password });
    if (!verificationResult.success) {
        return next(createError(verificationResult.message, 403));
    }

    let user = await Customers.findOne({ email });
    let isAdmin = false;

    if (!user) {
        user = await Admin.findOne({ email });
        if (user) isAdmin = true;
    }

    if (!user) {
        return next(createError("User not found", 404));
    }

    if (!(await isPasswordValid(password, user.password))) {
        return next(createError("Invalid password", 401));
    }

    const token = generateToken(user._id, isAdmin);
    const decoded = jwt.decode(token);

    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin,
    }

    if (!isAdmin && user.address) {
        userData.address = user.address;
    }

    res.status(200).json({
        message: "Login Successful",
        success: true,
        statusCode: 200,
        token,
        tokenType: "Bearer",
        expiresIn: decoded.exp,
        user: userData,
    });
});