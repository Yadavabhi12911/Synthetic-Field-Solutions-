import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { Admin } from "../models/admin.models.js";
import bcrypt from 'bcrypt';
import { uploadOnCloudinary } from "../utility/cloudinary.js";

const changeAdminPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.Admin._id;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    // Verify old password
    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    // Check if new password is same as old password
    const isNewPasswordSame = await admin.isPasswordCorrect(newPassword);
    if (isNewPasswordSame) {
        throw new ApiError(400, "New password must be different from old password");
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

const updateAdminProfile = asyncHandler(async (req, res) => {
    const adminId = req.Admin._id;
    const { companyName, email, mobileNumber, userName } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    // Check if email is already taken by another admin
    if (email && email !== admin.email) {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            throw new ApiError(400, "Email is already taken");
        }
    }

    // Check if username is already taken by another admin
    if (userName && userName !== admin.userName) {
        const existingAdmin = await Admin.findOne({ userName });
        if (existingAdmin) {
            throw new ApiError(400, "Username is already taken");
        }
    }

    // Handle profile picture upload
    let adminPicUrl = admin.adminPic;
    if (req.file) {
        const adminPicLocalPath = req.file.path;
        const adminPic = await uploadOnCloudinary(adminPicLocalPath);
        if (adminPic) {
            adminPicUrl = adminPic.url;
        }
    }

    // Update admin fields
    if (companyName) admin.companyName = companyName;
    if (email) admin.email = email;
    if (mobileNumber !== undefined) admin.mobileNumber = mobileNumber;
    if (userName) admin.userName = userName;
    if (adminPicUrl) admin.adminPic = adminPicUrl;

    await admin.save();

    const updatedAdmin = await Admin.findById(adminId).select("-password -refreshToken -accessToken");

    return res.status(200).json(
        new ApiResponse(200, updatedAdmin, "Profile updated successfully")
    );
});

const getSystemSettings = asyncHandler(async (req, res) => {
    // For now, return default settings
    // In a real application, these would be stored in a database
    const systemSettings = {
        bookingTimeLimit: 30, // minutes
        cancellationTimeLimit: 5, // minutes
        autoCompleteTime: 60, // minutes
        maxBookingsPerUser: 3,
        maintenanceMode: false
    };

    return res.status(200).json(
        new ApiResponse(200, systemSettings, "System settings fetched successfully")
    );
});

const updateSystemSettings = asyncHandler(async (req, res) => {
    const {
        bookingTimeLimit,
        cancellationTimeLimit,
        autoCompleteTime,
        maxBookingsPerUser,
        maintenanceMode
    } = req.body;

    // Validate input values
    if (bookingTimeLimit && (bookingTimeLimit < 1 || bookingTimeLimit > 120)) {
        throw new ApiError(400, "Booking time limit must be between 1 and 120 minutes");
    }

    if (cancellationTimeLimit && (cancellationTimeLimit < 1 || cancellationTimeLimit > 60)) {
        throw new ApiError(400, "Cancellation time limit must be between 1 and 60 minutes");
    }

    if (autoCompleteTime && (autoCompleteTime < 30 || autoCompleteTime > 180)) {
        throw new ApiError(400, "Auto complete time must be between 30 and 180 minutes");
    }

    if (maxBookingsPerUser && (maxBookingsPerUser < 1 || maxBookingsPerUser > 10)) {
        throw new ApiError(400, "Max bookings per user must be between 1 and 10");
    }

    // In a real application, these settings would be saved to a database
    // For now, we'll just return the updated settings
    const updatedSettings = {
        bookingTimeLimit: bookingTimeLimit || 30,
        cancellationTimeLimit: cancellationTimeLimit || 5,
        autoCompleteTime: autoCompleteTime || 60,
        maxBookingsPerUser: maxBookingsPerUser || 3,
        maintenanceMode: maintenanceMode || false
    };

    return res.status(200).json(
        new ApiResponse(200, updatedSettings, "System settings updated successfully")
    );
});

export { changeAdminPassword, updateAdminProfile, getSystemSettings, updateSystemSettings }; 