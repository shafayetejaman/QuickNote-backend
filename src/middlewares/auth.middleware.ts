import jwt from "jsonwebtoken"
import {
    cookieOptions,
    cookieOptionsWithPath,
} from "../controllers/user.heper.controller"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import { Payload } from "../interfaces/customPlayload"

export default asyncHandler(async (req, res, next) => {
    const statusCode = 401
    const accessToken =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!accessToken) throw new ApiError("Access Token required!", statusCode)

    let payload
    try {
        payload = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN as string
        )
    } catch (error) {
        console.error(error)
        res.clearCookie("accessToken", cookieOptions).clearCookie(
            "refreshToken",
            cookieOptionsWithPath
        )
        return new ApiRespose("Access Token Invalid!", statusCode).send(res)
    }
    req.user = payload as Payload

    next()
})
