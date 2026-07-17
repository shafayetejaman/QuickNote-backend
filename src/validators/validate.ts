import { RequestHandler } from "express"
import { body, validationResult } from "express-validator"
import ApiError from "../utils/apiError"

export const validate: RequestHandler = (req, _res, next) => {
    const result = validationResult(req)
    if (result.isEmpty()) {
        return next()
    }
    const errors = result.array().map((error) => {
        if (error.type === "field") return { [error.path]: error.msg }
        return error.msg
    })

    throw new ApiError("Invalid data given!", 422, null, errors)
}

export function commonBodyValidation(
    name: string,
    baseMessage = `Invalid ${name}!`
) {
    return body(name, baseMessage)
        .exists()
        .withMessage(`${name} not given!`)
        .trim()
        .isEmpty()
        .withMessage(`${name} is empty!`)
        .escape()
}
