import { Router } from "express";
import { cancelBooking, completeBooking, createBooking, getBooking, getBookingHistory, submitRating, isTurfAvailable } from "../controllers/booking.controller.js";
import { verifyJwt} from "../middleware/auth.middleware.js"
import { verifyAdminJwt } from "../middleware/admin.auth.middleware.js";
import { verifyUserOrAdminJwt } from "../middleware/combined.auth.middleware.js";

const bookingRouter = Router()

bookingRouter.route("/book_turf/:turfId").post(verifyJwt,createBooking)

bookingRouter.route("/get_booking/:bookingId").get(verifyJwt,getBooking)

bookingRouter.route("/get_booking_history").get(verifyJwt,getBookingHistory)

//! Booking history for admin
bookingRouter.route("/get_booking_history").get(verifyAdminJwt,getBookingHistory)

bookingRouter.route("/cancel_booking/:bookingId").post(verifyUserOrAdminJwt,cancelBooking)

// Manual completion only for admins - users cannot manually complete bookings
bookingRouter.route("/complete_booking/:bookingId").post(verifyAdminJwt,completeBooking)

bookingRouter.route("/submit_rating/:bookingId").post(verifyJwt,submitRating)

bookingRouter.route("/isTurf_available").get(verifyJwt, isTurfAvailable)

export default bookingRouter