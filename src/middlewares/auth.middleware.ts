import jwt from "jsonwebtoken"
import {
    cookieOptions,
    cookieOptionsWithPath,
} from "../controllers/user.controller"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import { Payload } from "../customeInterface/customPlayload"

// TODO: refector to express validator and class based param
function validateJwtField(payload: any): payload is Payload {
    if (payload === null || typeof payload !== "object") return false

    if (payload.profileImageUrl) {
        if (typeof payload.profileImageUrl !== "string") return false
    }

    const keys = Object.keys(payload)
    const pKeys = ["_id", "username", "timeStamp", "role"]

    for (const key of keys) {
        if (!pKeys.includes(key)) return false
    }

    return (
        typeof payload._id === "string" &&
        typeof payload.username === "string" &&
        typeof payload.timeStamp === "number" &&
        typeof payload.role === "string"
    )
}

export default asyncHandler(async (req, res, next) => {
    const statusCode = 401
    const accessToken =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!accessToken) throw new ApiError(statusCode, "Access Token required!")

    let payload = null
    try {
        payload = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN as string
        )
    } catch (error) {
        console.error(error)
        return res
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptionsWithPath)
            .status(statusCode)
            .json(new ApiRespose(statusCode, "Access Token Invalid!"))
    }
    if (validateJwtField(payload)) req.user = payload

    next()
})
