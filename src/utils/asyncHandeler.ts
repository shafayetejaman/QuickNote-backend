import { NextFunction, Request, Response } from "express"

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>

function asyncHandler(func: AsyncHandler) {
    return function (req: Request, res: Response, next: NextFunction) {
        Promise.resolve(func(req, res, next)).catch((error) => {
            console.error("Error from asyncHandler: ", error)
            next()
        })
    }
}

export default asyncHandler
