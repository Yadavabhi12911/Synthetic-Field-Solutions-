import { Router } from "express";
import { loginAdmin, registerAdmin, updateAdminDetails,getCurrentAdmin } from "../controllers/admin.controller.js";
import { recalculateAllTurfRatings, getTurfRatingStats } from "../controllers/booking.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyAdminJwt } from "../middleware/admin.auth.middleware.js";



const adminRouter = Router()

adminRouter.route("/register-admin").post(
    upload.fields([
        {
            name: "adminPic",
            maxCount: 1
        }
    ]),
    registerAdmin)

 
    adminRouter.route("/admin-login").post(loginAdmin)

    //secured routes

    adminRouter.route("/admin-update-details").post( verifyAdminJwt ,updateAdminDetails)
    adminRouter.route("/getcurrent-admin").post( verifyAdminJwt, getCurrentAdmin) 
    adminRouter.route("/recalculate-ratings").post( verifyAdminJwt, recalculateAllTurfRatings)
    adminRouter.route("/turf-rating-stats/:turfId").get( verifyAdminJwt, getTurfRatingStats)


      
   

    export default adminRouter

    // {
    //     "companyName": "Turf Paradise",
    //     "mobileNumber": "1234567890",
    //     "description": "A premium turf for sports activities",
    //     "price": "500",
    //     "address": "123 Turf Street",
    //     "pincode": "123456",
    //     "turfTiming": "6 AM - 10 PM"
    //   }


//  {   "userName": "abhi",
//     "companyName": "Alpha",
//     "mobileNumber": "112233",
//     "email":"ak1@gmail.com",
//     "password": "abc123"
//  }
