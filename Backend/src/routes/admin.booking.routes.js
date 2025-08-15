import { Router } from "express";
import { getBookingHistory, triggerCompletionCheck } from "../controllers/booking.controller.js";
import { verifyAdminJwt } from "../middleware/admin.auth.middleware.js";

const adminBookingRouter = Router();

adminBookingRouter.route("/get_booking_history").get(verifyAdminJwt, getBookingHistory);
adminBookingRouter.route("/trigger-completion-check").post(verifyAdminJwt, triggerCompletionCheck);

export default adminBookingRouter; 


