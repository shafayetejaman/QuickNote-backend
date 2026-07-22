import type { NextFunction, RequestHandler, Response } from "express"
import type ICustomRequest from "../interfaces/request.interface"

export default function asyncHandler(
    func: (
        req: ICustomRequest,
        res: Response,
        next: NextFunction,
    ) => Promise<unknown>,
): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(func(req as ICustomRequest, res, next)).catch(
            (error) => {
                console.error("Error from asyncHandler: ", error)
                next(error)
            },
        )
    }
}
