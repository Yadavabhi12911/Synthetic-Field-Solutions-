import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utility/cloudinary.js";
import { User } from "../models/user.models.js";
import jwt from 'jsonwebtoken'



// register user 
// get info from user
// check info available or not
//already exit or not email, username
// upload image on cloudinary, return url as response
// create new user object in db
//remove password and refreshtoken field from response
// check user creation
// return response

const generateRefreshTokenandAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, password, fullName, mobileNumber, address } = req.body

    if ([userName, email, password, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all field required")
    }

    const userAlreadyExist = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (userAlreadyExist) {
        throw new ApiError(400, "user with this email or username already existed")
    }

    const imageLocalPath = req.files?.profilePic?.[0]?.path;
    let imageUrl = undefined;

    if (imageLocalPath) {
        const image = await uploadOnCloudinary(imageLocalPath);
        imageUrl = image?.url;
    }

    const user = await User.create({
        fullName,
        email,
        password,
        profilePic: imageUrl,
        userName: userName.toLowerCase(),
        mobileNumber: req.body.mobileNumber || '',
        address: req.body.address || '',
        preferences: {
            notifications: true,
            language: 'en',
            theme: 'dark'
        }
    })

    if (!user) {
        throw new ApiError(500, "Error creating user")
    }

    const createdUser = await User.findById(user._id).select(" -password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, " user not created")
    }

    // Generate tokens for the newly created user
    const { accessToken, refreshToken } = await generateRefreshTokenandAccessToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, { user: createdUser, token: accessToken }, "User registered successfully")
        )
})



const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    // generate access and referesh token
    //send cookie

    const { email, userName, password } = req.body


    if (!userName && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")

    // }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })




    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateRefreshTokenandAccessToken(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        // secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    const token = req.cookies?.refreshToken

    const decodedToeken = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

    await User.findByIdAndUpdate(
        decodedToeken._id,
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
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const changePassword = asyncHandler(async (req, res) => {

    const user = req.user
    if (!user) {
        throw new ApiError(400, "user not found during changing password")
    }

    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "old password and new password required")
    }


    // Verify old password
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid old password")
    }

    // Update password
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    const updatedPassword = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
        .json(new ApiResponse(200, { updatedPassword }, "password updated"))



})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingToken = await req.cookies?.refreshToken || req.body.refreshToken
    if (!incomingToken) {
        ApiError(400, "unauthorized access")
    }

    try {
        const decodedToken = await jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }


        if (incomingToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used")
        }

        const { accessToken, newRefreshToken } = await generateRefreshTokenandAccessToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"))
    } catch (err) {
        throw new ApiError(400, err?.message || "invalid refresh token ")
    }
})

const updateDetails = asyncHandler(async (req, res) => {

    const { fullName, userName: newUserName, mobileNumber, address } = req.body

    if (!fullName && !newUserName && !mobileNumber && !address) {
        throw new ApiError(400, "At least one field required to update")
    }

    const { _id } = req.user

    const user = await User.findById(_id)

    if (!user) {
        throw new ApiError(400, "user not authorized or login")
    }

    // Update basic fields
    if (fullName) user.fullName = fullName
    if (newUserName) user.userName = newUserName.toLowerCase()
    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber
    if (address !== undefined) user.address = address

    // Handle profile picture update only if a new file is provided
    const profilePicLocalPath = req.file?.path
    if (profilePicLocalPath) {
        // Delete old profile picture if it exists
        if (user.profilePic) {
            const deleteOldProfilePicPath = await deleteFromCloudinary(user.profilePic)
            if (!deleteOldProfilePicPath) {
                console.log("Warning: Could not delete old profile picture")
            }
        }
        
        // Upload new profile picture
        const newProfilePath = await uploadOnCloudinary(profilePicLocalPath)
        if (newProfilePath?.url) {
            user.profilePic = newProfilePath.url
        }
    }

    await user.save({ validateBeforeSave: false })

    // Return updated user without password and refreshToken
    const updatedUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
        .json(new ApiResponse(200, { user: updatedUser }, "details updated"))

})

const getCurrentUser = asyncHandler(async (req, res) => {

    const { _id } = req.user

    // Fetch complete user data from database
    const user = await User.findById(_id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200)
        .json(new ApiResponse(200, user, "User fetched Successfully"))
})

const updatePreferences = asyncHandler(async (req, res) => {
    const { preferences } = req.body

    if (!preferences) {
        throw new ApiError(400, "Preferences data required")
    }

    const { _id } = req.user

    const user = await User.findById(_id)

    if (!user) {
        throw new ApiError(400, "user not authorized or login")
    }

    // Update preferences
    if (preferences.notifications !== undefined) {
        if (!user.preferences) user.preferences = {};
        user.preferences.notifications = preferences.notifications;
    }
    if (preferences.language !== undefined) {
        if (!user.preferences) user.preferences = {};
        user.preferences.language = preferences.language;
    }
    if (preferences.theme !== undefined) {
        if (!user.preferences) user.preferences = {};
        user.preferences.theme = preferences.theme;
    }

    await user.save({ validateBeforeSave: false })

    // Return updated user without password and refreshToken
    const updatedUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
        .json(new ApiResponse(200, { user: updatedUser }, "Preferences updated successfully"))
})

export { registerUser, loginUser, logoutUser, changePassword, refreshAccessToken, updateDetails, getCurrentUser, updatePreferences }
