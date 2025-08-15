import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { User } from "../models/user.models.js";
import { Booking } from "../models/booking.models.js";
import { Turf } from "../models/turf.model.js";
import mongoose from "mongoose";

const getAnalyticsData = asyncHandler(async (req, res) => {
    try {
        const adminId = req.Admin._id;

        // Get date range for filtering
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Get admin's turfs
        const adminTurfs = await Turf.find({ owner: adminId }).distinct('_id');

        // Get bookings for admin's turfs (or all bookings if admin has no turfs)
        let allBookings = [];
        if (adminTurfs.length > 0) {
            allBookings = await Booking.find({ turf: { $in: adminTurfs } })
                .populate('turf', 'description price')
                .populate('user', 'fullName email')
                .lean();
        }

        // Filter bookings by date range
        const monthlyBookings = allBookings.filter(booking => 
            new Date(booking.createdAt) >= startOfMonth
        );

        const yearlyBookings = allBookings.filter(booking => 
            new Date(booking.createdAt) >= startOfYear
        );

        // Calculate metrics
        const totalUsers = await User.countDocuments();
        const totalBookings = allBookings.length;
        const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.turf?.price || 0), 0);
        
        // Calculate average rating
        const ratedBookings = allBookings.filter(booking => booking.rating);
        const averageRating = ratedBookings.length > 0 
            ? ratedBookings.reduce((sum, booking) => sum + booking.rating, 0) / ratedBookings.length
            : 0;

        // Booking status counts
        const completedBookings = allBookings.filter(booking => booking.status === 'completed').length;
        const pendingBookings = allBookings.filter(booking => booking.status === 'confirmed').length;
        const canceledBookings = allBookings.filter(booking => booking.status === 'canceled').length;

        // Active turfs count
        const activeTurfs = await Turf.countDocuments({ owner: adminId, isActive: true });

        // Generate monthly revenue data
        const monthlyRevenue = generateMonthlyRevenue(allBookings);

        // Generate booking trends
        const bookingTrends = generateBookingTrends(allBookings);

        // Generate top turfs
        const topTurfs = generateTopTurfs(allBookings);

        // Generate user growth
        const userGrowth = await generateUserGrowth();

        const analyticsData = {
            totalUsers,
            totalBookings,
            totalRevenue,
            averageRating: Math.round(averageRating * 10) / 10,
            activeTurfs,
            completedBookings,
            pendingBookings,
            canceledBookings,
            monthlyRevenue,
            bookingTrends,
            topTurfs,
            userGrowth
        };

        // Debug logging
        console.log('Analytics Data Generated:', {
            totalUsers,
            totalBookings,
            totalRevenue,
            averageRating: Math.round(averageRating * 10) / 10,
            activeTurfs,
            completedBookings,
            pendingBookings,
            canceledBookings,
            monthlyRevenueLength: monthlyRevenue.length,
            bookingTrendsLength: bookingTrends.length,
            topTurfsLength: topTurfs.length,
            userGrowthLength: userGrowth.length
        });

        return res.status(200).json(
            new ApiResponse(200, analyticsData, "Analytics data fetched successfully")
        );
    } catch (error) {
        console.error('Error in getAnalyticsData:', error);
        throw new ApiError(500, "Error fetching analytics data");
    }
});

const getRevenueData = asyncHandler(async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const adminId = req.Admin._id;

        // Get admin's turfs
        const adminTurfs = await Turf.find({ owner: adminId }).distinct('_id');

        // Get bookings for admin's turfs (or empty array if no turfs)
        let allBookings = [];
        if (adminTurfs.length > 0) {
            allBookings = await Booking.find({ turf: { $in: adminTurfs } })
                .populate('turf', 'description price')
                .lean();
        }

        let revenueData;
        if (period === 'monthly') {
            revenueData = generateMonthlyRevenue(allBookings);
        } else if (period === 'yearly') {
            revenueData = generateYearlyRevenue(allBookings);
        } else {
            revenueData = generateWeeklyRevenue(allBookings);
        }

        return res.status(200).json(
            new ApiResponse(200, revenueData, "Revenue data fetched successfully")
        );
    } catch (error) {
        console.error('Error in getRevenueData:', error);
        throw new ApiError(500, "Error fetching revenue data");
    }
});

const getBookingTrends = asyncHandler(async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const adminId = req.Admin._id;

        // Get admin's turfs
        const adminTurfs = await Turf.find({ owner: adminId }).distinct('_id');

        // Get bookings for admin's turfs (or empty array if no turfs)
        let allBookings = [];
        if (adminTurfs.length > 0) {
            allBookings = await Booking.find({ turf: { $in: adminTurfs } })
                .populate('turf', 'description price')
                .lean();
        }

        let trendsData;
        if (period === 'weekly') {
            trendsData = generateBookingTrends(allBookings);
        } else if (period === 'monthly') {
            trendsData = generateMonthlyBookingTrends(allBookings);
        } else {
            trendsData = generateYearlyBookingTrends(allBookings);
        }

        return res.status(200).json(
            new ApiResponse(200, trendsData, "Booking trends fetched successfully")
        );
    } catch (error) {
        console.error('Error in getBookingTrends:', error);
        throw new ApiError(500, "Error fetching booking trends");
    }
});

// Helper functions
const generateMonthlyRevenue = (bookings) => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueByMonth = {};
        
        months.forEach(month => revenueByMonth[month] = 0);
        
        if (Array.isArray(bookings)) {
            bookings.forEach(booking => {
                if (booking && booking.createdAt && booking.turf?.price) {
                    const date = new Date(booking.createdAt);
                    if (!isNaN(date.getTime())) {
                        const month = months[date.getMonth()];
                        revenueByMonth[month] += booking.turf.price || 0;
                    }
                }
            });
        }

        return months.map(month => ({
            month,
            revenue: revenueByMonth[month]
        }));
    } catch (error) {
        console.error('Error in generateMonthlyRevenue:', error);
        return [];
    }
};

const generateYearlyRevenue = (bookings) => {
    try {
        const currentYear = new Date().getFullYear();
        const revenueByYear = {};
        
        for (let year = currentYear - 5; year <= currentYear; year++) {
            revenueByYear[year] = 0;
        }
        
        if (Array.isArray(bookings)) {
            bookings.forEach(booking => {
                if (booking && booking.createdAt && booking.turf?.price) {
                    const date = new Date(booking.createdAt);
                    if (!isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        if (revenueByYear[year] !== undefined) {
                            revenueByYear[year] += booking.turf.price || 0;
                        }
                    }
                }
            });
        }

        return Object.entries(revenueByYear).map(([year, revenue]) => ({
            year,
            revenue
        }));
    } catch (error) {
        console.error('Error in generateYearlyRevenue:', error);
        return [];
    }
};

const generateWeeklyRevenue = (bookings) => {
    try {
        const last4Weeks = Array.from({ length: 4 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7));
            return date.toISOString().split('T')[0];
        }).reverse();

        const revenueByWeek = {};
        last4Weeks.forEach(week => revenueByWeek[week] = 0);

        if (Array.isArray(bookings)) {
            bookings.forEach(booking => {
                if (booking && booking.createdAt && booking.turf?.price) {
                    const date = new Date(booking.createdAt).toISOString().split('T')[0];
                    if (revenueByWeek[date] !== undefined) {
                        revenueByWeek[date] += booking.turf.price || 0;
                    }
                }
            });
        }

        return last4Weeks.map(week => ({
            week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: revenueByWeek[week]
        }));
    } catch (error) {
        console.error('Error in generateWeeklyRevenue:', error);
        return [];
    }
};

const generateBookingTrends = (bookings) => {
    try {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const bookingsByDate = {};
        last7Days.forEach(date => bookingsByDate[date] = 0);

        if (Array.isArray(bookings)) {
            bookings.forEach(booking => {
                if (booking && booking.createdAt) {
                    const date = new Date(booking.createdAt).toISOString().split('T')[0];
                    if (bookingsByDate[date] !== undefined) {
                        bookingsByDate[date]++;
                    }
                }
            });
        }

        return last7Days.map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            bookings: bookingsByDate[date]
        }));
    } catch (error) {
        console.error('Error in generateBookingTrends:', error);
        return [];
    }
};

const generateMonthlyBookingTrends = (bookings) => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const bookingsByMonth = {};
        
        months.forEach(month => bookingsByMonth[month] = 0);
        
        if (Array.isArray(bookings)) {
            bookings.forEach(booking => {
                if (booking && booking.createdAt) {
                    const date = new Date(booking.createdAt);
                    if (!isNaN(date.getTime())) {
                        const month = months[date.getMonth()];
                        bookingsByMonth[month]++;
                    }
                }
            });
        }

        return months.map(month => ({
            month,
            bookings: bookingsByMonth[month]
        }));
    } catch (error) {
        console.error('Error in generateMonthlyBookingTrends:', error);
        return [];
    }
};

const generateYearlyBookingTrends = (bookings) => {
    try {
        const currentYear = new Date().getFullYear();
        const bookingsByYear = {};
        
        for (let year = currentYear - 5; year <= currentYear; year++) {
            bookingsByYear[year] = 0;
        }
        
        if (Array.isArray(bookings)) {
            bookings.forEach(booking => {
                if (booking && booking.createdAt) {
                    const date = new Date(booking.createdAt);
                    if (!isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        if (bookingsByYear[year] !== undefined) {
                            bookingsByYear[year]++;
                        }
                    }
                }
            });
        }

        return Object.entries(bookingsByYear).map(([year, bookings]) => ({
            year,
            bookings
        }));
    } catch (error) {
        console.error('Error in generateYearlyBookingTrends:', error);
        return [];
    }
};

const generateTopTurfs = (bookings) => {
    try {
        const turfStats = {};
        
        if (Array.isArray(bookings)) {
            bookings.forEach(booking => {
                if (booking && booking.turf) {
                    const turfName = booking.turf.description || 'Unknown Turf';
                    if (!turfStats[turfName]) {
                        turfStats[turfName] = { bookings: 0, revenue: 0 };
                    }
                    turfStats[turfName].bookings++;
                    turfStats[turfName].revenue += booking.turf.price || 0;
                }
            });
        }

        return Object.entries(turfStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);
    } catch (error) {
        console.error('Error in generateTopTurfs:', error);
        return [];
    }
};

const generateUserGrowth = async () => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const usersByMonth = {};
        
        months.forEach(month => usersByMonth[month] = 0);
        
        const users = await User.find().select('createdAt');
        if (Array.isArray(users)) {
            users.forEach(user => {
                if (user && user.createdAt) {
                    const date = new Date(user.createdAt);
                    if (!isNaN(date.getTime())) {
                        const month = months[date.getMonth()];
                        usersByMonth[month]++;
                    }
                }
            });
        }

        return months.map(month => ({
            month,
            users: usersByMonth[month]
        }));
    } catch (error) {
        console.error('Error in generateUserGrowth:', error);
        return [];
    }
};

export { getAnalyticsData, getRevenueData, getBookingTrends }; 