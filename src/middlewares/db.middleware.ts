import { NextFunction, Request, Response } from "express"
import { dbConnect } from "../db/db"
import ApiError from "../utils/apiError"

// global db connection
let dbPromise: Promise<void> | null = null

export default async function dbMiddleware(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // lazyload db connection
    if (!dbPromise) {
        dbPromise = dbConnect().catch((err) => {
            console.error("DB connection failed:", err)
            dbPromise = null
        })
    }

    try {
        await dbPromise
    } catch (error) {
        throw new ApiError("Database unavailable", 503, error)
    }
    next()
}
