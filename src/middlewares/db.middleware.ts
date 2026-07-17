import mongoose from "mongoose"
import { NextFunction, Request, Response } from "express"
import { dbConnect } from "../db/db"
import ApiError from "../utils/apiError"
import { DB_CONNECTION_TIMEOUT } from "../constants"

export default async function dbMiddleware(
    _req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    if (mongoose.connection.readyState === 1) {
        return next()
    }

    try {
        await Promise.race([
            dbConnect(),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("Connection timeout")),
                    DB_CONNECTION_TIMEOUT
                )
            ),
        ])
        next()
    } catch (error) {
        throw new ApiError("Database unavailable", 503, error)
    }
}
