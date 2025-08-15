import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/apiResponse.js"
import { asyncHandler } from "../utility/asyncHandler.js";
import { Turf } from "../models/turf.model.js";
import { Admin} from "../models/admin.models.js"
import { uploadOnCloudinary } from "../utility/cloudinary.js";
import cloudinary from 'cloudinary';

import mongoose from "mongoose";





/*
! --------> required 
------> data of admin,
------> data of turf name, location , price , 
*/

const getAllTurfs = asyncHandler(async (req, res) => {
    const {
        page = 1,
        query = "",
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc"
    } = req.query;

    const sortOrder = sortType === "asc" ? 1 : -1;

    // Build match condition
    let matchCondition = {};
    if (query) {
        matchCondition = {
            $or: [
                { address: { $regex: query, $options: "i" } },
                { pincode: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]
        };
    }

    const allTurfs = await Turf.aggregate([
        {
            $match: matchCondition
        },
        {
            $lookup: {
                from: "admins",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                description: 1,
                price: 1,
                address: 1,
                pincode: 1,
                ContactNumber: 1,
                turfTiming: 1,
                photos: 1,
                averageRating: 1,
                totalRatings: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    userName: "$ownerDetails.userName",
                    companyName: "$ownerDetails.companyName"
                },
                createdAt: 1,
                updatedAt: 1
            }
        },
        {
            $sort: {
                [sortBy]: sortOrder
            }
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, allTurfs, "Fetched All Turfs")
    );
});

// Get turfs owned by the logged-in admin
const getAdminTurfs = asyncHandler(async (req, res) => {
    const adminId = req.Admin._id;
    
    const {
        page = 1,
        query = "",
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc"
    } = req.query;

    const sortOrder = sortType === "asc" ? 1 : -1;

    // Build match condition - only include turfs owned by this admin
    let matchCondition = { owner: adminId };
    if (query) {
        matchCondition = {
            $and: [
                { owner: adminId },
                {
                    $or: [
                        { address: { $regex: query, $options: "i" } },
                        { pincode: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } }
                    ]
                }
            ]
        };
    }

    const adminTurfs = await Turf.aggregate([
        {
            $match: matchCondition
        },
        {
            $lookup: {
                from: "admins",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                description: 1,
                price: 1,
                address: 1,
                pincode: 1,
                ContactNumber: 1,
                turfTiming: 1,
                photos: 1,
                averageRating: 1,
                totalRatings: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    userName: "$ownerDetails.userName",
                    companyName: "$ownerDetails.companyName"
                },
                createdAt: 1,
                updatedAt: 1
            }
        },
        {
            $sort: {
                [sortBy]: sortOrder
            }
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, adminTurfs, "Fetched Admin Turfs")
    );
});


const createTurfs = asyncHandler(async (req, res) => {
    console.log('FILES RECEIVED:', req.files);
    console.log('BODY RECEIVED:', req.body);
    const admin = req.Admin; // Get the admin object from req
    if (!admin) {
        throw new ApiError(400, "Admin not found");
    }

    const {description, price, address, pincode, turfTiming, ContactNumber } = req.body;

    if([description, price, address, pincode].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if(!turfTiming){
        throw new ApiError(401, "please provide the turf timings")
    }

    // Upload each photo to Cloudinary
    let photoUrls = [];
    if (req.files && req.files.turfPhotos) {
        for (const file of req.files.turfPhotos) {
            const result = await uploadOnCloudinary(file.path);
            console.log('Cloudinary upload result:', result);
            if (result?.url) {
                photoUrls.push({ photos: result.url });
            }
        }
    }

    const turfs = await Turf.create({
        owner: admin._id,
        company: admin.companyName,
        ContactNumber: ContactNumber ? parseInt(ContactNumber) : parseInt(admin.mobileNumber),
        description,
        price: parseFloat(price),
        address,
        pincode,
        turfTiming: (Array.isArray(turfTiming) ? turfTiming : [turfTiming]).map(time => ({ time, status: true })),
        photos: photoUrls,
    });

    return res.status(201).json(new ApiResponse(201, { turfs }, "Turf Listed"));
});



const updateTurf = asyncHandler(async (req, res) => {
    const { turfId } = req.params;
    const admin = req.Admin; // Get the admin object from req

    const id = mongoose.isValidObjectId(turfId)
    if(!id){
        throw new ApiError(401,"invalid id" )
    }

    console.log('turf_id ======>' , turfId);

    // Accept standard field names from frontend
    const { description, price, contactNumber, address, pincode, turfTiming } = req.body;
    console.log('Received price:', price);

    const turf = await Turf.findById(turfId)
    if (!turf) {
        throw new ApiError(404, "Turf not found")
    }

    // Ownership check
    if (turf.owner.toString() !== admin._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this turf");
    }

    if (description) turf.description = description;
    if (price && !isNaN(Number(price))) turf.price = price;
    if (contactNumber) turf.ContactNumber = contactNumber;
    if (address) turf.address = address;
    if (pincode) turf.pincode = pincode;

    // Handle turfTiming update
    if (turfTiming) {
        let parsedTiming = turfTiming;
        if (typeof turfTiming === 'string') {
            // If only one slot, it may come as a string
            parsedTiming = [turfTiming];
        }
        if (Array.isArray(parsedTiming) && typeof parsedTiming[0] === 'string') {
            turf.turfTiming = parsedTiming.map(time => ({ time, status: true }));
        } else {
            turf.turfTiming = parsedTiming;
        }
        // Sort turfTiming by time in increasing order
        turf.turfTiming.sort((a, b) => {
            // Try to parse as time, fallback to string compare
            const tA = a.time;
            const tB = b.time;
            // If times are in format like '6 AM', '10 PM', parse to 24h for comparison
            const parseTime = t => {
                const match = t.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
                if (!match) return t;
                let hour = parseInt(match[1], 10);
                const min = match[2] ? parseInt(match[2], 10) : 0;
                const ampm = match[3].toUpperCase();
                if (ampm === 'PM' && hour !== 12) hour += 12;
                if (ampm === 'AM' && hour === 12) hour = 0;
                return hour * 60 + min;
            };
            const valA = parseTime(tA);
            const valB = parseTime(tB);
            if (typeof valA === 'number' && typeof valB === 'number') {
                return valA - valB;
            }
            return tA.localeCompare(tB);
        });
    }

    // Handle new image uploads and removal of specific images
    let photosToKeep = [];
    if (req.body.existingPhotos) {
        if (Array.isArray(req.body.existingPhotos)) {
            photosToKeep = req.body.existingPhotos.map(photoObj =>
                typeof photoObj === 'string'
                    ? JSON.parse(photoObj)
                    : photoObj
            );
        } else if (typeof req.body.existingPhotos === 'string') {
            photosToKeep = [JSON.parse(req.body.existingPhotos)];
        }
    } else {
        photosToKeep = turf.photos || [];
    }
    // Delete removed images from Cloudinary
    if (req.body.removedPhotos) {
        const removed = Array.isArray(req.body.removedPhotos)
            ? req.body.removedPhotos
            : [req.body.removedPhotos];
        for (const public_id of removed) {
            try {
                await cloudinary.v2.uploader.destroy(public_id);
            } catch (err) {
                console.error('Failed to delete image from Cloudinary:', public_id, err);
            }
        }
    }
    if (req.files && req.files.turfPhotos) {
        let photoUrls = [];
        for (const file of req.files.turfPhotos) {
            const result = await uploadOnCloudinary(file.path);
            if (result?.url && result?.public_id) {
                photoUrls.push({ photos: result.url, public_id: result.public_id });
            }
        }
        turf.photos = [...photosToKeep, ...photoUrls];
    } else {
        turf.photos = photosToKeep;
    }

    await turf.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(201, { turf }, "Details Updated"))
})

const deleteTurf = asyncHandler(async (req, res) => {
    const { turfId } = req.params
    const admin = req.Admin;

    const turf = await Turf.findById(turfId)
    if (!turf) {
        throw new ApiError(404, " Turf not found")
    }

    // Ownership check
    if (turf.owner.toString() !== admin._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this turf");
    }

    await Turf.findByIdAndDelete(turfId)
    return res
        .status(200)
        .json(new ApiResponse(201, { }, "turf  deleted successfully"))
})

const toggleTurfSlotStatus = asyncHandler(async (req, res) => {
    const { turfId } = req.params;
    const { time } = req.body;
    if (!turfId || !time) {
        throw new ApiError(400, "Turf ID and time are required");
    }
    const turf = await Turf.findById(turfId);
    if (!turf) {
        throw new ApiError(404, "Turf not found");
    }
    let updated = false;
    turf.turfTiming = turf.turfTiming.map(slot => {
        if (slot.time === time) {
            updated = true;
            return { ...slot.toObject(), status: !slot.status };
        }
        return slot;
    });
    if (!updated) {
        throw new ApiError(404, "Time slot not found");
    }
    await turf.save();
    return res.status(200).json(new ApiResponse(200, turf, "Slot status updated"));
});

const getTurfById = asyncHandler(async (req, res) => {
    const { turfId } = req.params;
    
    if (!mongoose.isValidObjectId(turfId)) {
        throw new ApiError(400, "Invalid turf ID");
    }

    const turf = await Turf.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(turfId) }
        },
        {
            $lookup: {
                from: "admins",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                description: 1,
                price: 1,
                address: 1,
                pincode: 1,
                ContactNumber: 1,
                turfTiming: 1,
                photos: 1,
                averageRating: 1,
                totalRatings: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    userName: "$ownerDetails.userName",
                    companyName: "$ownerDetails.companyName"
                },
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    if (!turf || turf.length === 0) {
        throw new ApiError(404, "Turf not found");
    }

    return res.status(200).json(new ApiResponse(200, turf[0], "Turf details fetched successfully"));
});

const getTurfReviews = asyncHandler(async (req, res) => {
    const { turfId } = req.params;
    
    if (!mongoose.isValidObjectId(turfId)) {
        throw new ApiError(400, "Invalid turf ID");
    }

    // Check if turf exists
    const turf = await Turf.findById(turfId);
    if (!turf) {
        throw new ApiError(404, "Turf not found");
    }

    // Get all reviews for this turf
    const reviews = await mongoose.model("Booking").aggregate([
        {
            $match: {
                turf: new mongoose.Types.ObjectId(turfId),
                status: "completed",
                rating: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                rating: 1,
                review: 1,
                bookingDate: 1,
                timeSlot: 1,
                createdAt: 1,
                user: {
                    _id: "$userDetails._id",
                    userName: "$userDetails.userName",
                    fullName: "$userDetails.fullName",
                    profilePic: "$userDetails.profilePic"
                }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, reviews, "Turf reviews fetched successfully"));
});

export { createTurfs, updateTurf, deleteTurf, getAllTurfs, getAdminTurfs, toggleTurfSlotStatus, getTurfById, getTurfReviews } 