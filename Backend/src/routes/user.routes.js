
import { Router } from "express";
import { changePassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateDetails, updatePreferences } from "../controllers/user.controller.js";
import {upload} from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getAllTurfs, getTurfById, getTurfReviews } from "../controllers/turfPost.controller.js";


const router = Router() 

router.route("/register").post(
    upload.fields([
        {
            name: "profilePic",
            maxCount: 1
        }
    ]),
    
    registerUser)

    router.route("/login").post(loginUser)

    // secured routes user
    router.route("/logout").get(verifyJwt, logoutUser)
    router.route("/change-password").put( verifyJwt ,changePassword)
    router.route("/update-detail").put(
        verifyJwt,
        upload.single("profilePic"),
        updateDetails
    )
    router.route("/update-preferences").put(verifyJwt, updatePreferences)
    router.route("/getcurrent-user").get(verifyJwt, getCurrentUser)
    router.route("/refreshToken").post(verifyJwt, refreshAccessToken)
    router.route("/getAll-Turfs").get(getAllTurfs)
    router.route("/turf/:turfId").get(getTurfById)
    router.route("/turf/:turfId/reviews").get(getTurfReviews)
    
    
    
 

export default router

