import { ErrorRequestHandler } from "express"
import ApiError from "../utils/apiError"

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ApiError && err?.statusCode) {
        res.status(err.statusCode).json(err)
    } else {
        res.status(500).json(new ApiError())
    }
    next()
}
