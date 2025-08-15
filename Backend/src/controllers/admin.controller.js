import { Admin } from "../models/admin.models.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { uploadOnCloudinary } from "../utility/cloudinary.js";
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshToken = async (adminId) => {

    try {
        const admin = await Admin.findById(adminId)

        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken

         await admin.save({ validateBeforeSave: false })
        


        return { accessToken, refreshToken }
    }
    catch (err) {
        throw new ApiError(400, "error while generating tokens", err.message)
    }
}


const registerAdmin = asyncHandler(async (req, res) => {

    // collect details from user
    // check if user already exist or not
    // create new admin object in db
    // return admin as object
    const { userName, email, password, companyName, mobileNumber } = req.body
  
    

    if([userName, email, password, companyName, mobileNumber].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all field required")
    }
    const alreadyExist = await Admin.findOne({
        $or: [{ userName }, { email }, { mobileNumber }, { companyName }]
    })
    if (alreadyExist) {
        throw new ApiError(400, "admin already exist")
    }

    // Handle profile picture upload
    const adminPicLocalPath = req.files?.adminPic?.[0]?.path;
    let adminPicUrl = undefined;

    if (adminPicLocalPath) {
        const adminPic = await uploadOnCloudinary(adminPicLocalPath);
        adminPicUrl = adminPic?.url;
    }

    const admin = await Admin.create({
        companyName,
        userName,
        mobileNumber,
        email,
        password,
        adminPic: adminPicUrl
    })

    if (!admin) {
        throw new ApiError(401, "admin not created ")
    }

    const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken")
    if (!createdAdmin) {
        throw new ApiError(400, "admin already exist")
    }

    // Generate tokens for the newly created admin
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(admin._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, { user: createdAdmin, accessToken }, "Admin registered successfully"))
})

const loginAdmin = asyncHandler(async (req, res) => {
    const { userName, password, email } = req.body


    if (!password) {
        throw new ApiError(401, "password required")
    }

    if (!userName && !email) {
        throw new ApiError(400, "required  userName or email")
    }

    const admin = await Admin.findOne(
        { $or: [{ userName }, { email }] }
    )


    if (!admin) {
        throw new ApiError(400, "admin not found")
    }

    const isPasswordValid = await admin.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid admin credentials")
    }

    const { refreshToken, accessToken } = await generateAccessTokenAndRefreshToken(admin._id)

    const logInAdmin = await Admin.findById(admin._id).select(" -refreshToken -password")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, { user: logInAdmin, accessToken }, "Admin LogIn Successfully"))





})

const updateAdminDetails = asyncHandler(async (req, res) => {
    const { mobileNumber } = req.body;


    if (!mobileNumber) {
        throw new ApiError(400, "required mobile number");
    }


    // Get admin details from req.Admin
    const { userName } = req.Admin;


    const admin = await Admin.findById(userName._id)


    if (!admin) {
        throw new ApiError(400, "user not authorized or login")
    }

    // Update admin details
    const updated = await Admin.findByIdAndUpdate(
        req.Admin._id,
        {
            $set: {
                mobileNumber: mobileNumber,

            }
        },
        { new: true }
    );


    return res.status(200).json(new ApiResponse(200, { admin, updated }, "admin details Updated"));
});

const getCurrentAdmin = asyncHandler(async (req, res) => {


    return res.status(200)
        .json(new ApiResponse(200, req.Admin, "User fetched Successfully"))
})

const logOutAdmin = asyncHandler(async (req, res) => {
    let admin = req.Admin
    if (!admin) {
        throw new ApiError(400, "admin not authoerized !, login again")
    }

    await Admin.findByIdAndUpdate(
        admin.id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, {}, "Admin LogOut SuccessFully"))
})


const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingToken = await req.cookies?.refrehToken || req.body.refreshToken

    if(! incomingToken){
        throw new ApiError(400, "unauthorized acces")
    }

    try{
        const decodedToken = await jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)
        const admin = await Admin.findById(decodedToken?._id  )
        if(! admin){
            throw new ApiError(401, "Inavlid refresh Token")
        }

        if(incomingToken !== admin.refreshToken){
            throw new ApiError(401, "refresh token is expired or used")
        }

        const {accessToken, NewrefrehToken} = await generateAccessTokenAndRefreshToken(admin._id)

        const options= {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options )
        .cookie("refreshToken", refrehToken, options)
        .json( new ApiResponse(200, {accessToken, refrehToken: NewrefrehToken}, "Access token refresh"))
    }catch(err){
        throw new ApiError(400, err.message || "invalid refresh token")
    }
})


const changePassword = asyncHandler( async (req, res) => {

    let admin = req.Admin
    if(!admin){
        throw new ApiError(400, "Admin not found during changing password")
    }

    let newPassword = req.body
    if(! newPassword || newPassword.length > 3){
        throw new ApiError(400, "please enter the password")
    }



    let updatedPassword = await Admin.findByIdAndUpdate(
        admin._id ,
        {
        $set:{
            password: newPassword
        }
        },
        {
            new: true
        }
    )
return res
.status(200)
.json( new ApiResponse(200, {updatedPassword}, "password change updated"))

})

export { registerAdmin, generateAccessTokenAndRefreshToken, loginAdmin, updateAdminDetails, getCurrentAdmin , logOutAdmin, refreshAccessToken, changePassword}