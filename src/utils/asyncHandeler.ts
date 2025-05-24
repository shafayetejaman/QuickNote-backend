import { NextFunction, RequestHandler, Response } from "express"
import { CustomRequest } from "../customRequest"

function asyncHandler(
    func: (
        req: CustomRequest,
        res: Response,
        next: NextFunction
    ) => Promise<any>
): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(func(req as CustomRequest, res, next)).catch(
            (error) => {
                console.error("Error from asyncHandler: ", error)
                next(error)
            }
        )
    }
}

export default asyncHandler
