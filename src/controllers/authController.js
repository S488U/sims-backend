import jwt from "jsonwebtoken";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Admin from "../models/admin/adminModel.js";
import Customers from "../models/customers/customerModel.js";
import { verifyData } from "../utils/verifyData.js";
import { createError } from "../utils/errorUtils.js";
import { isPasswordValid } from "../utils/hashPassword.js";

const generateToken = (id, isAdmin) => {
    if(!process.env.JWT_TOKEN) {
        throw createError("JWT token is missing", 500);
    }

    return jwt.sign({id, isAdmin}, process.env.JWT_TOKEN, { expiresIn: "7d" });
}

// @ Both login for Customers and Admin
export const login = asyncHandler( async(req, res, next) => {
    const {email, password} = req.body;

    const verificationResult = verifyData({ email, password });
    if(!verificationResult.success) {
        return next(createError(verificationResult.message, 403));
    }

    let user = await Customers.findOne({ email });
    let isAdmin = false;

    if(!user) {
        user = await Admin.findOne({email});
        isAdmin = true;
    }

    if(!user) {
        return next(createError("User not found", 404));
    }

    if(!(await isPasswordValid(password, user.password))) {
        return next(createError("Invalid password", 401));
    }

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
        token: generateToken(user._id, isAdmin),
        user: userData,
    })
});