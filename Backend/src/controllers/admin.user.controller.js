import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { User } from "../models/user.models.js";
import { Booking } from "../models/booking.models.js";
import mongoose from "mongoose";

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        // Get all users with booking count
        const users = await User.aggregate([
            {
                $lookup: {
                    from: "bookings",
                    localField: "_id",
                    foreignField: "user",
                    as: "bookings"
                }
            },
            {
                $addFields: {
                    bookingCount: { $size: "$bookings" }
                }
            },
            {
                $project: {
                    password: 0,
                    refreshToken: 0,
                    bookings: 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        return res.status(200).json(
            new ApiResponse(200, users, "Users fetched successfully")
        );
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        throw new ApiError(500, "Error fetching users");
    }
});

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Get booking count for this user
    const bookingCount = await Booking.countDocuments({ user: userId });

    const userWithBookingCount = {
        ...user.toObject(),
        bookingCount
    };

    return res.status(200).json(
        new ApiResponse(200, userWithBookingCount, "User details fetched successfully")
    );
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { fullName, userName, email, mobileNumber, address, isActive } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, "Email is already taken");
        }
    }

    // Check if username is already taken by another user
    if (userName && userName !== user.userName) {
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            throw new ApiError(400, "Username is already taken");
        }
    }

    // Update user fields
    if (fullName) user.fullName = fullName;
    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
    if (address !== undefined) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(userId).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully")
    );
});

const deleteUserByAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if user has any active bookings
    const activeBookings = await Booking.find({
        user: userId,
        status: { $in: ['confirmed', 'completed'] }
    });

    if (activeBookings.length > 0) {
        throw new ApiError(400, "Cannot delete user with active bookings");
    }

    // Delete user's bookings first
    await Booking.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});

const toggleUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Toggle the isActive status
    user.isActive = !user.isActive;
    await user.save();

    const updatedUser = await User.findById(userId).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`)
    );
});

export { getAllUsers, getUserById, updateUserByAdmin, deleteUserByAdmin, toggleUserStatus }; 