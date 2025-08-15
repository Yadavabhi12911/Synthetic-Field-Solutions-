import { Router } from "express";
import { getAnalyticsData, getRevenueData, getBookingTrends } from "../controllers/admin.analytics.controller.js";
import { verifyAdminJwt } from "../middleware/admin.auth.middleware.js";

const adminAnalyticsRouter = Router();

// Get overall analytics data
adminAnalyticsRouter.route("/analytics").get(verifyAdminJwt, getAnalyticsData);

// Get revenue data by period
adminAnalyticsRouter.route("/analytics/revenue").get(verifyAdminJwt, getRevenueData);

// Get booking trends by period
adminAnalyticsRouter.route("/analytics/bookings").get(verifyAdminJwt, getBookingTrends);

export default adminAnalyticsRouter; 