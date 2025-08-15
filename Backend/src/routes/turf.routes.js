import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyAdminJwt } from "../middleware/admin.auth.middleware.js";
import { createTurfs , deleteTurf, getAllTurfs, getAdminTurfs, updateTurf, toggleTurfSlotStatus, getTurfById } from "../controllers/turfPost.controller.js";


//! -----> turf posting
const turfRouter = Router()

turfRouter.route("/create_turf").post(
    verifyAdminJwt,
    upload.fields([{ name: "turfPhotos", maxCount: 5 }]),
    (req, res, next) => {
        console.log("Route hit");
        next();
    },
    createTurfs
);

// secured routes

turfRouter.route("/turf_update_details/:turfId").put(
    verifyAdminJwt,
    upload.fields([{ name: "turfPhotos", maxCount: 5 }]),
    updateTurf
);

turfRouter.route("/turf_delete/:turfId").delete(verifyAdminJwt, deleteTurf)

turfRouter.route("/getAll-Turfs").get(verifyAdminJwt,getAllTurfs)
turfRouter.route("/admin-turfs").get(verifyAdminJwt,getAdminTurfs)

turfRouter.route("/:turfId").get(getTurfById)

turfRouter.route("/toggle_slot/:turfId").put(verifyAdminJwt, toggleTurfSlotStatus)



export default turfRouter

//  "userName": "Alpha01",
//     "password": "Abc123"



// {
//     "companyName": "Turf Paradise",
//     "mobileNumber": "1234567890",
//     "description": "A premium turf for sports activities",
//     "price": "500",
//     "address": "123 Turf Street",
//     "pincode": "123456",
//     "turfTiming": "6 AM - 10 PM"
//   }


