import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { Admin } from "../models/admin.models.js";
import { ApiError } from "../utility/ApiError.js";

export const verifyUserOrAdminJwt = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Try to find user first
        let user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (user) {
            req.user = user;
            req.userType = 'user';
            return next();
        }

        // If user not found, try to find admin
        let admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (admin) {
            req.Admin = admin;
            req.userType = 'admin';
            return next();
        }

        // If neither user nor admin found
        throw new ApiError(401, "Invalid access token: User/Admin not found");

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
}; 