import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { Booking } from "../models/booking.models.js";
import { Turf } from "../models/turf.model.js";
import mongoose from "mongoose";


const createBooking = asyncHandler(async (req, res) => {

    try {
        const userId = req.user._id

        const { turfId } = req.params


        const { bookingDate, timeSlot } = req.body;

        if (!turfId || !bookingDate || !timeSlot) {
            throw new ApiError(400, "All fields are required");
        }


        const turf = await Turf.findById(turfId);
        if (!turf) {
            throw new ApiError(404, "Turf not found");
        }

        // Additional validation for current day bookings
        const bookingDateObj = new Date(bookingDate);
        const today = new Date();
        
        // If booking is for today, check if the time slot has already passed
        if (bookingDateObj.toDateString() === today.toDateString()) {
            const timeInfo = parseTimeSlot(timeSlot);
            if (timeInfo) {
                const slotStartTime = new Date(bookingDateObj);
                slotStartTime.setHours(timeInfo.hour, timeInfo.minute, 0, 0);
                
                // Check if the slot time has already passed (current time is after slot start time)
                if (today > slotStartTime) {
                    const currentTime = today.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                    });
                    const slotTime = slotStartTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                    });
                    throw new ApiError(400, `Cannot book slot at ${slotTime} as current time is ${currentTime}. Please book a future time slot.`);
                }
                
                // Allow booking if slot starts in the next 30 minutes or later
                const thirtyMinutesFromNow = new Date(today.getTime() + 30 * 60 * 1000);
                
                if (slotStartTime < thirtyMinutesFromNow) {
                    throw new ApiError(400, "This time slot starts too soon. Please book a slot that starts at least 30 minutes from now.");
                }
            }
        }

        const booking = await Booking.create({
            user: userId,
            turf: turfId,
            bookingDate,
            timeSlot,
            status: "confirmed",
        });

        return res.status(201).json(new ApiResponse(201, booking, "Booking created successfully"));
    } catch (error) {
        // If it's an ApiError, re-throw it so it can be handled properly
        if (error instanceof ApiError) {
            throw error;
        }
        
        // Handle other errors (like duplicate booking)
        return res.status(400).json(
            new ApiResponse(400, null, "This slot is already booked by the user")
        )
    }
});

const getBooking = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    return res.status(200).json(new ApiResponse(200, booking, "Booking details fetched successfully"));
});

const getBookingHistory = asyncHandler(async (req, res) => {

    const userId = req.user?._id;
    const adminId = req.Admin?._id; // Use capital A to match middleware

    if (!userId && !adminId) {
        throw new ApiError(404, " please login again !")
    }

    try {
        // First, let's try a simpler approach using populate
        let query = {};
        if (userId) {
            query = { user: userId };
        } else if (adminId) {
            const adminTurfs = await Turf.find({ owner: adminId }).distinct('_id');
            query = { turf: { $in: adminTurfs } };
        }

        console.log('Query:', JSON.stringify(query, null, 2));

        // Use populate instead of aggregation for now
        const bookings = await Booking.find(query)
            .populate({
                path: 'turf',
                select: 'description address price photos owner',
                populate: {
                    path: 'owner',
                    select: 'companyName mobileNumber'
                }
            })
            .populate({
                path: 'user',
                select: 'fullName userName email mobileNumber'
            })
            .lean();

        console.log('Raw bookings with populate:', JSON.stringify(bookings, null, 2));

        // Transform the data to match our expected format
        const bookingHistory = bookings.map(booking => ({
            _id: booking._id,
            id: booking._id, // For AdminDashboard compatibility
            bookingDate: booking.bookingDate,
            timeSlot: booking.timeSlot,
            status: booking.status,
            rating: booking.rating,
            review: booking.review,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            turfName: booking.turf?.description || 'Turf',
            location: booking.turf?.address || 'Location not available',
            price: booking.turf?.price || 0,
            ownerName: booking.turf?.owner?.companyName || 'Owner',
            ownerMobile: booking.turf?.owner?.mobileNumber || 'No mobile number',
            userName: booking.user?.fullName || booking.user?.userName || 'Unknown User',
            userEmail: booking.user?.email || 'No email',
            userMobile: booking.user?.mobileNumber || 'No mobile number',
            photos: booking.turf?.photos || [],
            // Frontend expected fields
            date: new Date(booking.bookingDate).toLocaleDateString(),
            time: booking.timeSlot,
            amount: `₹${booking.turf?.price || 0}`
        }));

        console.log('Transformed booking history:', JSON.stringify(bookingHistory, null, 2));

        return res.status(200).json(
            new ApiResponse(200, { bookingHistory }, "booking history fetched successfully")
        );

    } catch (error) {
        console.error('Error in getBookingHistory:', error);
        throw new ApiError(500, "Error fetching booking history");
    }

})

const cancelBooking = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;
    const userId = req.user?._id;
    const adminId = req.Admin?._id;

    if (!userId && !adminId) {
        throw new ApiError(401, "Unauthorized: Please login again");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    // Authorization check: Users can only cancel their own bookings, admins can cancel any booking
    if (userId && booking.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only cancel your own bookings");
    }

    if (booking.status === "canceled") {
        return res.status(400).json(
            new ApiResponse(400, null, "Booking is already canceled")
        );
    }

    // Time restriction only applies to users, not admins
    if (userId) {
        // Check if booking time has started (with 5-minute grace period)
        const now = new Date();
        const bookingDate = new Date(booking.bookingDate);
        
        // If booking date is in the past, it's already started
        if (bookingDate < now) {
            throw new ApiError(400, "Cannot cancel booking after the slot time has started");
        }
        
        // If booking date is today, check if slot time has started
        if (bookingDate.toDateString() === now.toDateString()) {
            const timeInfo = parseTimeSlot(booking.timeSlot);
            if (timeInfo) {
                const slotStartTime = new Date(bookingDate);
                slotStartTime.setHours(timeInfo.hour, timeInfo.minute, 0, 0);
                
                // Add 5 minutes grace period
                const gracePeriodEnd = new Date(slotStartTime.getTime() + 5 * 60 * 1000);
                
                if (now >= gracePeriodEnd) {
                    throw new ApiError(400, "Cannot cancel booking after 5 minutes from slot start time");
                }
            }
        }
    }

    booking.status = "canceled";
    await booking.save();

    return res.status(200).json(new ApiResponse(200, booking, "Booking canceled successfully"));

});

// Helper function to parse time slot (reuse from cronService)
const parseTimeSlot = (timeSlot) => {
    // Assuming timeSlot format is like "6:00 AM - 7:00 AM" or "6 AM - 7 AM"
    const timeMatch = timeSlot.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
    if (!timeMatch) return null;
    
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3].toUpperCase();
    
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    return { hour, minute };
};

const completeBooking = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.status === "canceled") {
        return res.status(400).json(
            new ApiResponse(400, null, "Cannot complete a canceled booking")
        );
    }

    if (booking.status === "completed") {
        return res.status(400).json(
            new ApiResponse(400, null, "Booking is already completed")
        );
    }

    booking.status = "completed";
    await booking.save();

    return res.status(200).json(new ApiResponse(200, booking, "Booking marked as completed successfully"));

});

const submitRating = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.status !== "completed") {
        throw new ApiError(400, "Can only rate completed bookings");
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only rate your own bookings");
    }

    // Store previous rating for comparison
    const previousRating = booking.rating;

    // Allow updating existing ratings
    booking.rating = rating;
    booking.review = review || null;
    await booking.save();

    // Update turf average rating
    await updateTurfRating(booking.turf);

    console.log(`Rating submitted: Booking ${bookingId}, Rating: ${rating}, Previous: ${previousRating}`);

    return res.status(200).json(new ApiResponse(200, booking, "Rating submitted successfully"));
});

const updateTurfRating = async (turfId) => {
    try {
        // Get all ratings for this turf
        const ratings = await Booking.find({
            turf: turfId,
            status: "completed",
            rating: { $exists: true, $ne: null }
        }).select('rating');

        if (ratings.length === 0) {
            // No ratings, set to default
            await Turf.findByIdAndUpdate(turfId, {
                averageRating: 0,
                totalRatings: 0
            });
            console.log(`No ratings found for turf ${turfId}, set to default`);
            return;
        }

        // Calculate average rating
        const totalRating = ratings.reduce((sum, booking) => sum + booking.rating, 0);
        const averageRating = Math.round((totalRating / ratings.length) * 10) / 10; // Round to 1 decimal place

        // Update turf with new rating
        await Turf.findByIdAndUpdate(turfId, {
            averageRating: averageRating,
            totalRatings: ratings.length
        });

        console.log(`Updated turf ${turfId} with average rating: ${averageRating} from ${ratings.length} ratings`);
    } catch (error) {
        console.error('Error updating turf rating:', error);
        throw error; // Re-throw to handle it properly
    }
};

// Function to recalculate all turf ratings (for admin use)
const recalculateAllTurfRatings = asyncHandler(async (req, res) => {
    try {
        const turfs = await Turf.find({});
        let updatedCount = 0;
        let errorCount = 0;

        for (const turf of turfs) {
            try {
                await updateTurfRating(turf._id);
                updatedCount++;
            } catch (error) {
                console.error(`Error updating rating for turf ${turf._id}:`, error);
                errorCount++;
            }
        }

        return res.status(200).json(new ApiResponse(200, {
            message: `Recalculated ratings for ${updatedCount} turfs`,
            updatedCount,
            errorCount
        }, "All turf ratings recalculated successfully"));
    } catch (error) {
        console.error('Error in recalculateAllTurfRatings:', error);
        throw new ApiError(500, "Error recalculating turf ratings");
    }
});

// Function to get detailed rating statistics for a specific turf
const getTurfRatingStats = asyncHandler(async (req, res) => {
    const { turfId } = req.params;

    if (!mongoose.isValidObjectId(turfId)) {
        throw new ApiError(400, "Invalid turf ID");
    }

    try {
        // Get all ratings for this turf
        const ratings = await Booking.find({
            turf: turfId,
            status: "completed",
            rating: { $exists: true, $ne: null }
        }).select('rating review createdAt user').populate('user', 'fullName userName');

        if (ratings.length === 0) {
            return res.status(200).json(new ApiResponse(200, {
                turfId,
                totalRatings: 0,
                averageRating: 0,
                ratingDistribution: {},
                recentRatings: []
            }, "No ratings found for this turf"));
        }

        // Calculate statistics
        const totalRating = ratings.reduce((sum, booking) => sum + booking.rating, 0);
        const averageRating = Math.round((totalRating / ratings.length) * 10) / 10;

        // Calculate rating distribution
        const ratingDistribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        ratings.forEach(booking => {
            ratingDistribution[booking.rating]++;
        });

        // Get recent ratings (last 10)
        const recentRatings = ratings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(booking => ({
                rating: booking.rating,
                review: booking.review,
                createdAt: booking.createdAt,
                user: booking.user
            }));

        const stats = {
            turfId,
            totalRatings: ratings.length,
            averageRating,
            ratingDistribution,
            recentRatings
        };

        return res.status(200).json(new ApiResponse(200, stats, "Turf rating statistics fetched successfully"));
    } catch (error) {
        console.error('Error getting turf rating stats:', error);
        throw new ApiError(500, "Error fetching turf rating statistics");
    }
});

const isTurfAvailable = async (turfId, bookingDate, timeSlot) => {
    const existingBooking = await Booking.findOne({
        turfId,
        bookingDate,
        timeSlot,
        status: "confirmed",
    });

    return !existingBooking; // Returns true if no conflicting booking exists
};

// Admin-only endpoint to manually trigger completion check (for testing)
const triggerCompletionCheck = asyncHandler(async (req, res) => {
    const { completeExpiredBookings } = await import('../services/cronService.js');
    
    try {
        await completeExpiredBookings();
        return res.status(200).json(new ApiResponse(200, null, "Completion check triggered successfully"));
    } catch (error) {
        console.error('Error in manual completion check:', error);
        throw new ApiError(500, "Error triggering completion check");
    }
});

export { createBooking, getBooking, getBookingHistory, cancelBooking, completeBooking, submitRating, isTurfAvailable, triggerCompletionCheck, recalculateAllTurfRatings, getTurfRatingStats };