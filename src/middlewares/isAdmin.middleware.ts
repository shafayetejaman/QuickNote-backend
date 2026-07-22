import ApiError from "../utils/apiError"
import asyncHandler from "../utils/asyncHandeler"

export const isAdmin = asyncHandler(async (req, _res, next) => {
    if (req.user?.role !== "admin")
        throw new ApiError("Admin access required", 403)

    next()
})
