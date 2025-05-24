import jwt from "jsonwebtoken"
import {
    cookieOptions,
    cookieOptionsWithPath,
    extractUserData,
} from "../controllers/user.controller"
import { cache } from "../db/db"
import { User } from "../models/users.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"

export default asyncHandler(async (req, res, next) => {
    let statusCode = 401
    const accessToken =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!accessToken) throw new ApiError(statusCode, "Access Token required!")

    let payload = null
    try {
        payload = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN as string
        ) as { username?: string; _id?: string }
    } catch (error) {
        console.error(error)
        res.clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptionsWithPath)
            .status(statusCode)
            .json(new ApiRespose(statusCode, "Access Token Expired!"))
    }

    req.user = cache.get(payload?.username || "")

    if (!payload || (req.user && req.user?._id.toString() != payload?._id)) {
        throw new ApiError(statusCode, "Access Token Invalid!")
    }

    if (!req.user) {
        const user = await User.findById(payload._id)
        if (!user) throw new ApiError(statusCode, "Access Token Invalid!")
        req.user = extractUserData(user)
        cache.set(user.username, req.user)
    }

    next()
})
