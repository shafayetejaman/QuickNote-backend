import jwt from "jsonwebtoken"
import { COOKIE_OPTIONS, COOKIE_OPTIONS_WITH_PATH } from "../constants"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import IPayload from "../interfaces/playload.interface"

export default asyncHandler(async (req, res, next) => {
    const accessToken =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!accessToken) throw new ApiError("Access Token required!", 401)

    let payload
    try {
        payload = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN as string
        )
    } catch (error) {
        console.error(error)
        res.clearCookie("accessToken", COOKIE_OPTIONS).clearCookie(
            "refreshToken",
            COOKIE_OPTIONS_WITH_PATH
        )
        return new ApiRespose("Access Token Invalid!", 401).send(res)
    }
    req.user = payload as IPayload

    next()
})
