import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utility/asyncHandler.js'
import { ApiError } from '../utility/ApiError.js'
import { User } from '../models/user.models.js'


const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return next(new ApiError(401, "User not authorized: Missing access token"))
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(new ApiError(401, "Access token expired"))
      }
      if (error.name === "JsonWebTokenError") {
        return next(new ApiError(401, "Invalid access token"))
      }
      return next(new ApiError(401, "Authorization error"))
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
      return next(new ApiError(401, "Invalid access token: User not found"))
    }
    
    req.user = user
    next()
  } catch (error) {
    next(new ApiError(500, "Internal server error"))
  }
})

export { verifyJwt }

