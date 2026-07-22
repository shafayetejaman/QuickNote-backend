import { ErrorRequestHandler } from "express"
import ApiError from "../utils/apiError"

export const errorHandler: ErrorRequestHandler = (err, _req, res) => {
    console.error("\n===  SYSTEM ERROR LOG  ===")
    console.error(err.stack || err)
    console.error(err?.cause?.stack)
    console.error("===========================\n")

    if (err instanceof ApiError && err?.statusCode) {
        return res.status(err.statusCode).json(err)
    } else {
        return res.status(500).json(new ApiError())
    }
}
