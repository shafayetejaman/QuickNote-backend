import { NextFunction, Request, Response } from "express"
import ApiError from "../utils/apiError"

function errorHandeler() {
    return (err: ApiError, req: Request, res: Response, next: NextFunction) => {
        const statusCode = err.statusCode
        res.status(statusCode).json(err)
        next()
    }
}

export default errorHandeler
