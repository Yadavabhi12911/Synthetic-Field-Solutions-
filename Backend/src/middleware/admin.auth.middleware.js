import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utility/asyncHandler.js'
import { ApiError } from '../utility/ApiError.js'
import { Admin } from '../models/admin.models.js'



export const verifyAdminJwt = async (req, res, next) => {
    try {
        console.log('Admin Auth Middleware - Headers:', req.headers);
        console.log('Admin Auth Middleware - Cookies:', req.cookies);
        
        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
        console.log('Admin Auth Middleware - Token:', token);
      
        if (!token) {
            throw new ApiError(401, "No token provided");
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('Admin Auth Middleware - Decoded token:', decoded);
       
        const admin = await Admin.findById(decoded._id);
        console.log('Admin Auth Middleware - Found admin:', admin ? admin._id : 'Not found');
       
        if (!admin) {
            throw new ApiError(404, "Admin not found");
        }

        req.Admin = admin; // Attach the admin object to req
        console.log('Admin Auth Middleware - Admin attached to req:', req.Admin._id);
        next();
    } catch (error) {
        console.error('Admin Auth Middleware - Error:', error);
        next(error);
    }
};



